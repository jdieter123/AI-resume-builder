const strBaseUrl = `http://localhost:8000` // Query Param or string query
const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const regPhone = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/

document.querySelector(`#btnGenerateResume`).addEventListener(`click`, () => {
    const strName = document.querySelector(`#txtName`).value.trim()
    const strEmail = document.querySelector(`#txtEmail`).value.trim()
    const strPhone = document.querySelector(`#txtPhone`).value.trim()
    const strLocation = document.querySelector(`#txtLocation`).value.trim()

    // Used AI to figure out how to get all selected jobs and skills from the checkboxes
    const arrSelectedJobs = Array.from(document.querySelectorAll(`#divJobSelectionList input[type=checkbox]:checked`)).map(checkbox => checkbox.value)
    const arrSelectedSkills = Array.from(document.querySelectorAll(`#divSkillSelectionList input[type=checkbox]:checked`)).map(checkbox => checkbox.value)

    // Save info to session storage
    sessionStorage.setItem("resumePersonalData", JSON.stringify({
        name: strName,
        email: strEmail,
        phone: strPhone,
        location: strLocation
    }))

    // verify data
    let blnError = false
    let strMessage = ''

    if (!regEmail.test(strEmail)) {
        blnError = true
        strMessage += `<p>You Must Enter a Valid Email</p>`
    }

    if (strName.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Name</p>`
    }

    if (!regPhone.test(strPhone)) {
        blnError = true
        strMessage += `<p>You Must Enter Valid a Phone Number</p>`
    }

    if (strLocation.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Location</p>`
    }

    if (arrSelectedJobs.length < 1) {
        blnError = true
        strMessage += `<p>You Must Select at Least One Job</p>`
    }

    if (arrSelectedSkills.length < 1) {
        blnError = true
        strMessage += `<p>You Must Select at Least One Skill</p>`
    }

    // if no errors, build resume
    if(blnError === false) {
        // show print button, AI generate button, and AI generate output
        const btnPrintResume = document.querySelector("#btnPrintResume")
        btnPrintResume.classList.remove("d-none")
        const btnAIGenerateResume = document.querySelector("#btnAIGenerateResume")
        btnAIGenerateResume.classList.remove("d-none")
        const divAIResumeOutputCard = document.querySelector("#divAIResumeOutputCard")
        divAIResumeOutputCard.classList.remove("d-none")

        fetch(strBaseUrl + "/jobs") // fetch jobs to send to resume generation
        .then(result => {
            if(result.ok)
                return result.json()
            else
                throw new Error(result.status)
        }).then(data => {
            if(data.outcome === "success") {
                const arrJobs = data.jobs.filter(objJob => arrSelectedJobs.includes(objJob.id.toString()))
                fetch(strBaseUrl + "/skills") // fetch skills to send to resume generation
                .then(result => {
                    if(result.ok)
                        return result.json()
                    else
                        throw new Error(result.status)
                })
                .then(data => {
                    if(data.outcome === "success") {
                        const arrSkills = data.skills.filter(objSkill => arrSelectedSkills.includes(objSkill.id.toString()))
                        buildResume(strName, strEmail, strPhone, strLocation, arrJobs, arrSkills) // build resume with selected jobs and skills
                    } else {
                        console.error("Error Fetching Skills: " + data.message)
                    }
                })
            } else {
                console.error("Error Fetching Jobs: " + data.message)
            }
        })
    } else { // if errors, show error message
        Swal.fire({
           title: "oh no!",
           html: strMessage,
           icon: "error"
        })
    }
})

// Build Resume Function - USED AI to help figure out how to build the resumes structure
function buildResume(strName, strEmail, strPhone, strLocation, arrJobs, arrSkills) {
    const divOutput = document.querySelector("#divResumeOutput")

    // Header section
    let html = `<div class="resume-header">
                    <h1>${strName}</h1>
                    <p>${strEmail} | ${strPhone} | ${strLocation}</p>
                </div>

                <div class="resume-section">
                    <h2>Experience</h2>`

    // Jobs section
    arrJobs.forEach(objJob => {
        html += `<div class="job">
                    <div class="job-title">${objJob.title}</div>
                    <div class="job-company">Company: ${objJob.company}</div>
                    <div class="job-responsibilities">${objJob.responsibilities}</div>
                </div>`
    })

    html += `</div>`

    // Skills section
    if(arrSkills.filter(objSkill => objSkill.type === "Skill").length > 0) {
        html += `<div class="resume-section">
                    <h2>Skills</h2>
                    <ul class="resume-list">`

        arrSkills.filter(objSkill => objSkill.type === "Skill").forEach(objSkill => {
            html += `<li>${objSkill.name}</li>`
        })

        html += `</ul></div>`
    }

    // Certifications section
    if(arrSkills.filter(objCertification => objCertification.type === "Certification").length > 0) {
        html += `<div class="resume-section">
                    <h2>Certifications</h2>
                    <ul class="resume-list">`
        
        arrSkills.filter(objCertification => objCertification.type === "Certification").forEach(objCertification => {
            html += `<li>${objCertification.name}</li>`
        })

        html += `</ul></div>`
    }

    // Awards section
    if(arrSkills.filter(objAward => objAward.type === "Award").length > 0) {
        html += `<div class="resume-section">
                    <h2>Awards</h2>
                    <ul class="resume-list">`
        
        arrSkills.filter(objAward => objAward.type === "Award").forEach(objAward => {
            html += `<li>${objAward.name}</li>`
        })

        html += `</ul></div>`
    }

    divOutput.innerHTML = html
}

document.querySelector(`#btnAIGenerateResume`).addEventListener(`click`, () => {
    const strName = document.querySelector(`#txtName`).value.trim()
    const strEmail = document.querySelector(`#txtEmail`).value.trim()
    const strPhone = document.querySelector(`#txtPhone`).value.trim()
    const strLocation = document.querySelector(`#txtLocation`).value.trim()

    // Used AI to figure out how to get all selected jobs and skills from the checkboxes
    const arrSelectedJobs = Array.from(document.querySelectorAll(`#divJobSelectionList input[type=checkbox]:checked`)).map(checkbox => checkbox.value)
    const arrSelectedSkills = Array.from(document.querySelectorAll(`#divSkillSelectionList input[type=checkbox]:checked`)).map(checkbox => checkbox.value)

    // Get saved API key from local storage
    const strAPIKey = localStorage.getItem("resumeAPIKey")

    // if no API key, show warning and reset button
    if(!strAPIKey) {
        Swal.fire({
            title: "API Key Required",
            text: "Please enter and save your API key before using the AI Rewrite feature.",
            icon: "warning"
        })

        return
    }

    // verify data
    let blnError = false
    let strMessage = ''

    if (!regEmail.test(strEmail)) {
        blnError = true
        strMessage += `<p>You Must Enter a Valid Email</p>`
    }
    if (strName.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Name</p>`
    }
    if (strPhone.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Phone Number</p>`
    }
    if (strLocation.length < 1) {
        blnError = true
        strMessage += `<p>You Must Enter a Location</p>`
    }
    if (arrSelectedJobs.length < 1) {
        blnError = true
        strMessage += `<p>You Must Select at Least One Job</p>`
    }
    if (arrSelectedSkills.length < 1) {
        blnError = true
        strMessage += `<p>You Must Select at Least One Skill</p>`
    }

    // if no errors, generate AI resume
    if(blnError === false) {
        // show print button
        const btnPrintAIResume = document.querySelector("#btnPrintAIResume")
        btnPrintAIResume.classList.remove("d-none")

        // disable button to prevent multiple clicks and show loading
        const btnAIGenerateResume = document.querySelector("#btnAIGenerateResume")
        btnAIGenerateResume.disabled = true
        btnAIGenerateResume.innerText = "Generating..."

        fetch(strBaseUrl + "/jobs") // fetch jobs to send to AI for resume generation
        .then(result => {
            if(result.ok)
                return result.json()
            else
                throw new Error(result.status)

        }).then(data => {
            if(data.outcome === "success") {
                const arrJobs = data.jobs.filter(objJob => arrSelectedJobs.includes(objJob.id.toString()))

                fetch(strBaseUrl + "/skills") // fetch skills to send to AI for resume generation
                .then(result => {
                    if(result.ok)
                        return result.json()
                    else
                        throw new Error(result.status)

                }).then(data => {
                    if(data.outcome === "success") {
                        const arrSkills = data.skills.filter(objSkill => arrSelectedSkills.includes(objSkill.id.toString()))
                        
                        fetch(strBaseUrl + "/generate-resume", { // send data to AI for resume generation
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ apiKey: strAPIKey, name: strName, email: strEmail, phone: strPhone, location: strLocation, jobs: arrJobs, skills: arrSkills })
                        }).then(result => {
                            if(result.ok)
                                return result.json()
                            else
                                throw new Error(result.status)
                        }).then(data => {
                            if(data.outcome === "success") {
                                // display AI generated resume in the AI resume output section
                                const divAIResumeOutput = document.querySelector("#divAIResumeOutput")
                                divAIResumeOutput.innerHTML = data.resume

                                console.log("AI Resume Generated Successfully")
                                
                                btnAIGenerateResume.disabled = false // reset button
                                btnAIGenerateResume.innerText = "AI Generate Resume"
                            } else {
                                console.error("Error Generating AI Resume: " + data.message)

                                btnAIGenerateResume.disabled = false // reset button
                                btnAIGenerateResume.innerText = "AI Generate Resume"
                            }
                        })

                    } else {
                        console.error("Error Fetching Skills: " + data.message)

                        btnAIGenerateResume.disabled = false // reset button
                        btnAIGenerateResume.innerText = "AI Generate Resume"
                    }
                })

            } else {
                console.error("Error Fetching Jobs: " + data.message)

                btnAIGenerateResume.disabled = false // reset button
                btnAIGenerateResume.innerText = "AI Generate Resume"
            }
        })
    } else { // if errors, show error message
        Swal.fire({
           title: "oh no!",
           html: strMessage,
           icon: "error"
        })
    }
})