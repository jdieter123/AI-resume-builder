// nav buttons
document.querySelector(`#btnGeneratorPage`).addEventListener("click", () => {

    document.querySelector(`#divGeneratorPage`).classList.remove("d-none")
    document.querySelector(`#divJobsPage`).classList.add("d-none")
    document.querySelector(`#divSkillsPage`).classList.add("d-none")

})

document.querySelector(`#btnJobsPage`).addEventListener("click", () => {

    document.querySelector(`#divGeneratorPage`).classList.add("d-none")
    document.querySelector(`#divJobsPage`).classList.remove("d-none")
    document.querySelector(`#divSkillsPage`).classList.add("d-none")

})

document.querySelector(`#btnSkillsPage`).addEventListener("click", () => {

    document.querySelector(`#divGeneratorPage`).classList.add("d-none")
    document.querySelector(`#divJobsPage`).classList.add("d-none")
    document.querySelector(`#divSkillsPage`).classList.remove("d-none")

})

// print resume - USED AI to help figure out how to implement printing
document.querySelector("#btnPrintResume").addEventListener("click", () => {
    const content = document.querySelector("#divResumeOutput").innerHTML

    const printWindow = window.open("", "_blank")
    printWindow.document.write(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Resume</title>
            <link rel="stylesheet" href="css/bootstrap.min.css">
            <link rel="stylesheet" href="css/resume.css">
        </head>
        <body>
            <div class="resume">
                ${content}
            </div>

            <script>
                window.onload = function () {
                    window.print()
                    window.onafterprint = function () {
                        window.close()
                    }
                }
            </script>
        </body>
        </html>`
    )

    printWindow.document.close()

})

// print AI resume - USED AI to help figure out how to implement printing
document.querySelector("#btnPrintAIResume").addEventListener("click", () => {
    const content = document.querySelector("#divAIResumeOutput").innerHTML

    const printWindow = window.open("", "_blank")
    printWindow.document.write(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <title>AI Resume</title>
            <link rel="stylesheet" href="css/bootstrap.min.css">
            <link rel="stylesheet" href="css/resume.css">
        </head>
        <body>
            <div class="mt-2">
                ${content}
            </div>

            <script>
                window.onload = function () {
                    window.print()
                    window.onafterprint = function () {
                        window.close()
                    }
                }
            </script>
        </body>
        </html>`
    )

    printWindow.document.close()

})

// save API key to local storage
document.querySelector(`#btnSaveApiKey`).addEventListener("click", () => {
    const strAPIKey = document.querySelector(`#txtApiKey`).value.trim()
    localStorage.setItem("resumeAPIKey", strAPIKey)

    Swal.fire({
        title: "Saved!",
        text: "Your API key has been saved.",
        icon: "success"
    })
})

// restore info from session and local storage
function restoreInfo() {
    const savedPersonalData = sessionStorage.getItem("resumePersonalData")
    const savedAPIKey = localStorage.getItem("resumeAPIKey")

    if(savedPersonalData) {
        const objPersonalData = JSON.parse(savedPersonalData)

        // populate personal info fields with saved data or empty string if no saved data for that field
        document.querySelector(`#txtName`).value = objPersonalData.name || ""
        document.querySelector(`#txtEmail`).value = objPersonalData.email || ""
        document.querySelector(`#txtPhone`).value = objPersonalData.phone || ""
        document.querySelector(`#txtLocation`).value = objPersonalData.location || ""
    }
    // populate API key field with saved API key or empty string if no saved API key
    if(savedAPIKey) {
        const strAPIKey = savedAPIKey
        document.querySelector(`#txtApiKey`).value = strAPIKey || ""
    }
}
restoreInfo() // restore info on page load

// Credits sweetalert
document.querySelector(`#btnCredits`).addEventListener("click", () => {
    Swal.fire({
        title: "Credits",
        html: `<div class="text-start">
                    <p><b>Included Libraries:</b></p>
                    <ul>
                        <li>Bootstrap 5</li>
                        <li>SweetAlert2</li>
                        <li>Node.js + Express</li>
                        <li>SQLite3</li>
                        <li>cors</li>
                    </ul>

                    <p><b>AI Services:</b></p>
                    <ul>
                        <li>Google Gemini API</li>
                    </ul>

                    <p><b>Development:</b></p>
                    <ul>
                        <li>Built by Justin Dieter</li>
                    </ul>
                </div>`,
        icon: "info"
    })
})