// Add Skills
document.querySelector(`#btnAddSkill`).addEventListener("click", () => {
    const strSkillName = document.querySelector(`#txtSkillName`).value.trim()
    const strSkillType = document.querySelector(`#txtSkillType`).value.trim()

    // check
    let blnError = false
    let strMessage = ''

    if (strSkillName.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Skill Name</p>`
    }
    if (strSkillType.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Skill Type</p>`
    }

    if (blnError === false) {
        fetch(strBaseUrl + '/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: 
                JSON.stringify({name: strSkillName, type: strSkillType})

        }).then(result => {
            if(result.ok)
                return result.json()
            else
                throw new Error(result.status)

        }).then(data => {
            if(data.outcome === "success") {
                getSkills()
                console.log("Skill Added Successfully")

            } else {
                console.error("Error Adding Skill: " + data.message)
            }
        })
    } else {
        Swal.fire({
           title: "oh no!",
           html: strMessage,
           icon: "error"
        })
    }
})

// Display Skills
function getSkills() {
    fetch(strBaseUrl + '/skills')
    .then(result => {
        if(result.ok)
            return result.json()
        else
            throw new Error(result.status)

    }).then(data => {
        if(data.outcome === "success") {
            // get the div where to display skills
            const divSkillList = document.querySelector("#divSkillList")
            const divSkillSelectionList = document.querySelector("#divSkillSelectionList")
            
            // loop through skills and create a card for each one
            divSkillList.innerHTML = ""
            divSkillSelectionList.innerHTML = ""
            data.skills.forEach(objSkill => {

                // Create a card for each skill with its details and a delete button
                const divCard = document.createElement("div")
                divCard.className = "card mb-2 p-2"
                divCard.innerHTML = `<b>${objSkill.name}</b>
                                     Type: ${objSkill.type}
                                     <div class="d-flex justify-content-end align-items-center">
                                        <button id="btnSuggestSkill-${objSkill.id}" class="btn btn-primary mx-2" type="button" onclick="suggestSkill(${objSkill.id})">AI Rewrite</button>
                                        <button id="btnDeleteSkill-${objSkill.id}" class="btn btn-danger" type="button" onclick="deleteSkill(${objSkill.id})">Delete</button>
                                     </div>` // Used AI to figure out how to add a delete button for each skill

                // Create a row for skill selection with a checkbox
                const divRow = document.createElement("div")
                divRow.className = "form-check card p-2 mb-2"
                divRow.innerHTML = `<div class="d-flex align-items-center">
                                        <div class="form-check mt-1">
                                            <input class="form-check-input" type="checkbox" value="${objSkill.id}" id="skill_${objSkill.id}">
                                        </div>
                                        <label class="form-check-label w-100" for="skill_${objSkill.id}">
                                            <div><b>${objSkill.name}</b> - ${objSkill.type}</div>
                                        </label>
                                    </div>` // Used AI to figure out how to create a checkbox for each skill in the selection list

                // Append the card to the skill list
                divSkillList.appendChild(divCard)

                // Append the row to the skill selection list
                divSkillSelectionList.appendChild(divRow)
            })

        } else {
            console.error("Error Adding Skill: " + data.message)
        }
    })  
}
getSkills() // load skills on page load

// Delete Skills
function deleteSkill(intID) {
    fetch(strBaseUrl + '/skills', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: 
            JSON.stringify({id: intID})
    })
    .then(result => {
        if(result.ok)
            return result.json()
        else
            throw new Error(result.status)
    }).then(data => {
        if(data.outcome === "success") {
            getSkills()
            console.log("Skill Deleted Successfully")
        } else {
            console.error("Error Deleting Skill: " + data.message)
        }
    })
}

// Suggest AI Rewrite for Skill
function suggestSkill(intID) {
    // disable button to prevent multiple clicks and show loading
    const btnSuggestSkill = document.querySelector(`#btnSuggestSkill-${intID}`)
    btnSuggestSkill.disabled = true
    btnSuggestSkill.innerText = "Generating..."

    // Get saved API key from session storage
    const strAPIKey = sessionStorage.getItem("resumeAPIKey")

    // if no API key, show warning and reset button
    if(!strAPIKey) {
        Swal.fire({
            title: "API Key Required",
            text: "Please enter and save your API key before using the AI Rewrite feature.",
            icon: "warning"
        })
        btnSuggestSkill.disabled = false
        btnSuggestSkill.innerText = "AI Rewrite"
        return
    }

    fetch(strBaseUrl + `/skills/${intID}`) // fetch the skill details to send to the AI for suggesting a rewrite
    .then(result => {
        if(result.ok)
            return result.json()
        else {
            btnSuggestSkill.disabled = false // reset button
            btnSuggestSkill.innerText = "AI Rewrite"
            throw new Error(result.status)
        }
    }).then(data => {
        if(data.outcome === "success") {
            const objSkill = data.skill

            fetch(strBaseUrl + '/suggest-skill', { // fetch the AI suggestion for the skill rewrite
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apiKey: strAPIKey, name: objSkill.name, type: objSkill.type })

            }).then(result => {
                if(result.ok)
                    return result.json()
                else {
                    btnSuggestSkill.disabled = false // reset button
                    btnSuggestSkill.innerText = "AI Rewrite"
                    throw new Error(result.status)
                }

            }).then(data => {
                if(data.outcome === "success") {
                    fetch(strBaseUrl + '/skills', { // update the skill with the AI suggested rewrite
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: intID, name: data.suggestion, type: objSkill.type }) // update only the skill details

                    }).then(result => {
                        if(result.ok)
                            return result.json()
                        else {
                            btnSuggestSkill.disabled = false // reset button
                            btnSuggestSkill.innerText = "AI Rewrite"
                            throw new Error(result.status)
                        }

                    }).then(data => {
                        if(data.outcome === "success") {
                            getSkills() // refresh the skill list to show the updated skill
                            console.log("Skill Updated with AI Suggestion Successfully")

                            btnSuggestSkill.disabled = false // reset button
                            btnSuggestSkill.innerText = "AI Rewrite"
                        } else {
                            console.error("Error Updating Skill with AI Suggestion: " + data.message)

                            btnSuggestSkill.disabled = false // reset button
                            btnSuggestSkill.innerText = "AI Rewrite"
                        }

                    })
                } else {
                    console.error("Error generating skill suggestion: " + data.message)

                    btnSuggestSkill.disabled = false // reset button
                    btnSuggestSkill.innerText = "AI Rewrite"
                }

            })
        } else {
            console.error("Error Fetching Skills: " + data.message)

            btnSuggestSkill.disabled = false // reset button
            btnSuggestSkill.innerText = "AI Rewrite"
        }
    })
}