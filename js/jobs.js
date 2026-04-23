// Add Jobs
document.querySelector(`#btnAddJob`).addEventListener("click", () => {
    const strTitle = document.querySelector(`#txtJobTitle`).value.trim()
    const strCompany = document.querySelector(`#txtCompany`).value.trim()
    const strResponsibilities = document.querySelector(`#txtResponsibilities`).value.trim()

    // check
    let blnError = false
    let strMessage = ''

    if (strTitle.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Job Title</p>`
    }
    if (strCompany.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Company</p>`
    }
    if (strResponsibilities.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter Responsibilities</p>`
    }

    if (blnError === false) {
        fetch(strBaseUrl + '/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: 
                JSON.stringify({title: strTitle, company: strCompany, responsibilities: strResponsibilities})

        }).then(result => {
            if(result.ok)
                return result.json()
            else
                throw new Error(result.status)

        }).then(data => {
            if(data.outcome === "success") {
                getJobs()
                console.log("Job Added Successfully")

            } else {
                console.error("Error Adding Job: " + data.message)
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

// Display Jobs
function getJobs() {
    fetch(strBaseUrl + '/jobs')
    .then(result => {
        if(result.ok)
            return result.json()
        else
            throw new Error(result.status)

    }).then(data => {
        if(data.outcome === "success") {
            // get the div where to display jobs
            const divJobList = document.querySelector("#divJobList")
            const divJobSelectionList = document.querySelector("#divJobSelectionList")
            
            // loop through jobs and create a card for each one
            divJobList.innerHTML = ""
            divJobSelectionList.innerHTML = ""
            data.jobs.forEach(objJob => {

                // Create a card for each job with its details and a delete button
                const divCard = document.createElement("div")
                divCard.className = "card mb-2 p-2"
                divCard.innerHTML = `<b class="text-dark">${objJob.title}</b>
                                    <p class="text-dark">Company: ${objJob.company}</p>
                                    <p class="text-dark">Responsibilities: ${objJob.responsibilities}</p>
                                    <div class="d-flex justify-content-end align-items-center">
                                       <button id="btnSuggestJob-${objJob.id}" class="btn btn-primary mx-2" type="button" onclick="suggestJob(${objJob.id})">AI Rewrite</button>
                                       <button id="btnDeleteJob-${objJob.id}" class="btn btn-danger" type="button" onclick="deleteJob(${objJob.id})">Delete</button>
                                    </div>` // Used AI to figure out how to add a delete button for each job and a button to suggest an AI rewrite for each job

                // Create a row for job selection with a checkbox
                const divRow = document.createElement("div")
                divRow.className = "form-check card p-2 mb-2"
                divRow.innerHTML = `<div class="d-flex align-items-start">
                                        <div class="form-check mt-1">
                                            <input class="form-check-input" type="checkbox" value="${objJob.id}" id="job_${objJob.id}">
                                        </div>
                                        <label class="form-check-label w-100 text-dark" for="job_${objJob.id}">
                                            <div class="fw-bold fs-6">${objJob.title}</div>
                                            <div class="mb-1">Company: ${objJob.company}</div>
                                            <div>${objJob.responsibilities}</div>
                                        </label>
                                    </div>` // Used AI to figure out how to create a checkbox for each job in the selection list

                // Append the card to the job list
                divJobList.appendChild(divCard)
                // Append the row to the job selection list
                divJobSelectionList.appendChild(divRow)
            })

        } else {
            console.error("Error Adding Job: " + data.message)
        }
    })  
}
getJobs() // load jobs on page load

// Delete Jobs
function deleteJob(intID) {
    fetch(strBaseUrl + '/jobs', {
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
            getJobs()
            console.log("Job Deleted Successfully")
        } else {
            console.error("Error Deleting Job: " + data.message)
        }
    })
}

// Suggest AI Rewrite for Job
function suggestJob(intID) {
    // disable button to prevent multiple clicks and show loading
    const btnSuggestJob = document.querySelector(`#btnSuggestJob-${intID}`)
    btnSuggestJob.disabled = true 
    btnSuggestJob.innerText = "Generating..."

    // Get saved API key from local storage
    const strAPIKey = localStorage.getItem("resumeAPIKey")

    // if no API key, show warning and reset button
    if(!strAPIKey) {
        Swal.fire({
            title: "API Key Required",
            text: "Please enter and save your API key before using the AI Rewrite feature.",
            icon: "warning"
        })
        btnSuggestJob.disabled = false
        btnSuggestJob.innerText = "AI Rewrite"
        return
    }

    fetch(strBaseUrl + `/jobs/${intID}`) // fetch the job details to send to the AI for suggesting a rewrite
    .then(result => {
        if(result.ok)
            return result.json()
        else {
            btnSuggestJob.disabled = false // reset button
            btnSuggestJob.innerText = "AI Rewrite"
            throw new Error(result.status)
        }
    }).then(data => {
        if(data.outcome === "success") {
            const objJob = data.job

            fetch(strBaseUrl + '/suggest-job', { // fetch the AI suggestion for the job rewrite
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apiKey: strAPIKey, title: objJob.title, company: objJob.company, responsibilities: objJob.responsibilities })

            }).then(result => {
                if(result.ok)
                    return result.json()
                else {
                    btnSuggestJob.disabled = false // reset button
                    btnSuggestJob.innerText = "AI Rewrite"
                    throw new Error(result.status)
                }

            }).then(data => {
                if(data.outcome === "success") {
                    fetch(strBaseUrl + '/jobs', { // update the job with the AI suggested rewrite
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: intID, title: objJob.title, company: objJob.company, responsibilities: data.suggestion }) // update only responsibilities

                    }).then(result => {
                        if(result.ok)
                            return result.json()
                        else {
                            btnSuggestJob.disabled = false // reset button
                            btnSuggestJob.innerText = "AI Rewrite"
                            throw new Error(result.status)
                        }

                    }).then(data => {
                        if(data.outcome === "success") {
                            getJobs() // refresh the job list to show the updated job
                            console.log("Job Updated with AI Suggestion Successfully")

                            btnSuggestJob.disabled = false // reset button
                            btnSuggestJob.innerText = "AI Rewrite"
                        } else {
                            console.error("Error Updating Job with AI Suggestion: " + data.message)

                            btnSuggestJob.disabled = false // reset button
                            btnSuggestJob.innerText = "AI Rewrite"
                        }

                    })
                } else {
                    console.error("Error generating job suggestion: " + data.message)

                    btnSuggestJob.disabled = false // reset button
                    btnSuggestJob.innerText = "AI Rewrite"
                }

            })
        } else {
            console.error("Error Fetching Jobs: " + data.message)

            btnSuggestJob.disabled = false // reset button
            btnSuggestJob.innerText = "AI Rewrite"
        }
    })
}