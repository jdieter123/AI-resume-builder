// npm install @google/genai express cors dotenv
const { GoogleGenAI } = require("@google/genai")
const express = require('express') // include express library
const sqlite3 = require('sqlite3').verbose() // include sqlite3, verbose = provide lots of details
const cors = require('cors')

const PORT = 8000

const app = express()
app.use(express.json())
app.use(cors())

// Initialize the Google GenAI client with the API key from our .env file
//const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY)
// identify the model we want to use for story generation
const model = "gemini-3-flash-preview"

const dbResume = new sqlite3.Database('database/resume.db', (err) => {
    if(err) {
        console.error("Error opening database: ", err.message)
    } else {
        console.log("Connected to resume.db")
    }
})

app.listen(PORT, () => { // allows app to listen, waits for http calls to be called to it
    console.log(`Listening on `, PORT)
})

// create job
app.post("/jobs", (req,res) => {
    const strTitle = req.body.title
    const strCompany = req.body.company
    const strResponsibilities = req.body.responsibilities

    // check
    if (!strTitle || !strCompany || !strResponsibilities) {
        return res.status(400).json({outcome: "error", message: "Missing title, company, or responsibilities in request body"})
    }

    const strQuery = "INSERT INTO tblJobs (title, company, responsibilities) VALUES (?, ?, ?)"
    dbResume.run(strQuery, [strTitle, strCompany, strResponsibilities], function(err) {
        if(err) {
            res.status(401).json({outcome: "error", message: "Creating job failed because " + err.message})
        } else {
            res.status(201).json({outcome: "success", message: "Job Creation Successful"})
        }
    })
})

// get jobs
app.get("/jobs", (req,res) => {
    const strQuery = "SELECT * FROM tblJobs"

    dbResume.all(strQuery, [], function(err, rows) {
        if(err) {
            res.status(500).json({outcome: "error", message: err.message})
        } else {
            res.status(200).json({outcome: "success", jobs: rows})
        }
    })
})

// get job by id
app.get("/jobs/:id", (req,res) => {
    const intID = req.params.id

    if (!intID) {
        return res.status(400).json({outcome: "error", message: "Missing job id in request parameters"})
    }

    const strQuery = "SELECT * FROM tblJobs WHERE id = ?"
    dbResume.get(strQuery, [intID], function(err, row) {
        if(err) {
            res.status(500).json({outcome: "error", message: err.message})
        } else {
            res.status(200).json({outcome: "success", job: row})
        }
    })
})

// delete jobs
app.delete("/jobs", (req,res) => {
    // getting jobs id from body data
    const intID = req.body.id

    if (!intID) {
        return res.status(400).json({outcome: "error", message: "Missing job id in request body"})
    }

    const strQuery = "DELETE FROM tblJobs WHERE id = ?"
    dbResume.run(strQuery, [intID], function(err) {
        if(err) {
            res.status(400).json({outcome: "error", message: "Failed to delete job"})
        } else {
            res.status(201).json({outcome: "success", message: "Job Deleted"})
        }
    })
})

// update jobs
app.put("/jobs", (req,res) => {
    const { id, title, company, responsibilities } = req.body

    if (!id || !title || !company || !responsibilities) {
        return res.status(400).json({outcome: "error", message: "Missing id, title, company, or responsibilities in request body"})
    }

    const strQuery = "UPDATE tblJobs SET title = ?, company = ?, responsibilities = ? WHERE id = ?"
    dbResume.run(strQuery, [title, company, responsibilities, id], function(err) {
        if(err) {
            res.status(400).json({outcome: "error", message: "Failed to update job"})
        } else {
            res.status(201).json({outcome: "success", message: "Job Updated"})
        }
    })
})

// create skill
app.post("/skills", (req,res) => {
    const strSkillName = req.body.name
    const strSkillType = req.body.type

    // check
    if (!strSkillName || !strSkillType) {
        return res.status(400).json({outcome: "error", message: "Missing skill name or type in request body"})
    }

    const strQuery = "INSERT INTO tblSkills (name, type) VALUES (?, ?)"
    dbResume.run(strQuery, [strSkillName, strSkillType], function(err) {
        if(err) {
            res.status(401).json({outcome: "error", message: "Creating skill failed because " + err.message})
        } else {
            res.status(201).json({outcome: "success", message: "Skill Creation Successful"})
        }
    })
})

// get skills
app.get("/skills", (req,res) => {
    const strQuery = "SELECT * FROM tblSkills"

    dbResume.all(strQuery, [], function(err, rows) {
        if(err) {
            res.status(500).json({outcome: "error", message: err.message})
        } else {
            res.status(200).json({outcome: "success", skills: rows})
        }
    })
})

// get skill by id
app.get("/skills/:id", (req,res) => {
    const intID = req.params.id

    if (!intID) {
        return res.status(400).json({outcome: "error", message: "Missing skill id in request parameters"})
    }

    const strQuery = "SELECT * FROM tblSkills WHERE id = ?"
    dbResume.get(strQuery, [intID], function(err, row) {
        if(err) {
            res.status(500).json({outcome: "error", message: err.message})
        } else {
            res.status(200).json({outcome: "success", skill: row})
        }
    })
})

// delete skills
app.delete("/skills", (req,res) => {
    // getting skill id from body data
    const intID = req.body.id

    if (!intID) {
        return res.status(400).json({outcome: "error", message: "Missing skill id in request body"})
    }

    const strQuery = "DELETE FROM tblSkills WHERE id = ?"
    dbResume.run(strQuery, [intID], function(err) {
        if(err) {
            res.status(400).json({outcome: "error", message: "Failed to delete skill"})
        } else {
            res.status(201).json({outcome: "success", message: "Skill Deleted"})
        }
    })
})

// update skills
app.put("/skills", (req,res) => {
    const { id, name, type } = req.body

    if (!id || !name || !type) {
        return res.status(400).json({outcome: "error", message: "Missing id, name, or type in request body"})
    }

    const strQuery = "UPDATE tblSkills SET name = ?, type = ? WHERE id = ?"
    dbResume.run(strQuery, [name, type, id], function(err) {
        if(err) {
            res.status(400).json({outcome: "error", message: "Failed to update skill"})
        } else {
            res.status(201).json({outcome: "success", message: "Skill Updated"})
        }
    })
})

// AI Job Suggestion
app.post("/suggest-job", async (req,res) => {
    const { apiKey, title, company, responsibilities } = req.body

    const genAI = new GoogleGenAI(apiKey) // initialize the GenAI client with the provided API key 

    if (!title || !company || !responsibilities) {
        return res.status(400).json({outcome: "error", message: "Missing title, company, or responsibilities in request body"})
    }

    try {
        const prompt = `Improve this job entry for a professional resume.
                        Title: ${title}, Company: ${company}, Responsibilities: ${responsibilities}.
                        Please provide an improved version of the job entry that is more concise and impactful for a resume.
                        Add html/css formatting if necessary (and only when appropriate) to make the job entry more visually appealing on a resume, MAKE SURE NOT TO BREAK OTHER HTML/CSS that might be present.
                        Return a better rewritten version of responsibilities only.
                        Do Not return a intro sentence such as Here is an improved, high-impact version of your responsibilities at Bank of America, formatted for a professional resume, just return the rewritten responsibilities with no additional characters or formatting.`

        const objResponse = await genAI.models.generateContent({
            model: model,
            contents: prompt,
        })

        res.json({outcome: "success", suggestion: objResponse.text.trim()})

    } catch (error) {
        console.error(error)
        res.status(500).send('Error generating job suggestion: ' + error.message)
    }

})

// AI Skill Suggestion
app.post("/suggest-skill", async (req,res) => {
    const { apiKey, name, type } = req.body

    const genAI = new GoogleGenAI(apiKey) // initialize the GenAI client with the provided API key 

    if (!name || !type) {
        return res.status(400).json({outcome: "error", message: "Missing name or type in request body"})
    }

    try {
        const prompt = `Improve this skill entry for a professional resume.
                        Name: ${name}, Type: ${type}. 
                        Please provide an improved version of the skill entry that is more concise and impactful for a resume.
                        Rewrite the skill to sound more professional and impactful.
                        Return a better rewritten version of name only (should be more descriptive and impactful, for example instead of "Python" it could be "Python Programming for Data Analysis")
                        Return only the rewritten name with no additional characters or formatting.
                        Do Not return a intro sentence such as Here is an improved, high-impact version of your name, formatted for a professional resume, just return the rewritten name with no additional characters or formatting.`

        const objResponse = await genAI.models.generateContent({
            model: model,
            contents: prompt,
        })

        res.json({outcome: "success", suggestion: objResponse.text.trim()})

    } catch (error) {
        console.error(error)
        res.status(500).send('Error generating skill suggestion: ' + error.message)
    }
})

// AI Resume Generation
app.post("/generate-resume", async (req,res) => {
    const { apiKey, name, email, phone, location, jobs, skills } = req.body

    const genAI = new GoogleGenAI(apiKey) // initialize the GenAI client with the provided API key 

    if (!name || !email || !phone || !location || !jobs || !skills) {
        return res.status(400).json({outcome: "error", message: "Missing name, email, phone, location, jobs, or skills in request body"})
    }

    try {
        const prompt = `Rewrite this resume into a polished professional version with the following details:
                        Name: ${name}, Email: ${email}, Phone: ${phone}, Location: ${location}, Jobs/Education: ${JSON.stringify(jobs)}, Skills: ${JSON.stringify(skills)}
                        Return a fully formatted HTML resume with sections for contact info, jobs/education, and skills. Make it visually appealing and easy to read, using formatting like bolding, bullet points, and section headers where appropriate.
                        Make it modern and professional.
                        Do NOT include explanations, only return HTML.
                        This will be put inside my website so make sure not to include any additional html, css, or body tags that might break the formatting of my website, only return the inner HTML of the resume itself.
                        DO NOT include any <html>, <meta>, <title>, <style>, <body>
                        AI should not invent job titles
                        Must preserve factual information
                        Should optimize for ATS readability
                        Background and foreground colors should be different enough to be easily read by ATS software.
                        Links rely on color to be distinguishable, Make sure the contrast is sufficient for accessibility.
                        Do Not return a intro sentence such as Here is a polished, professional version of your resume in HTML format, just return the HTML with no additional characters or formatting.`

        const objResponse = await genAI.models.generateContent({
            model: model,
            contents: prompt,
        })

        res.json({outcome: "success", resume: objResponse.text.trim()})

    } catch (error) {
        console.error(error)
        res.status(500).send('Error generating resume: ' + error.message)
    }
})