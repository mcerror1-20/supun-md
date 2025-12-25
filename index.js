const express = require('express');
const axios = require('axios');


const app = express();
const port = 3000;

// --- Configuration from .env ---
const GITHUB_TOKEN = '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';
const REPO_OWNER = 'THEMISADAS2007';
const REPO_NAME = 'SESSION-DB';
const SESSION_FOLDER_PATH = 'sessions';
// -------------------------------

// Base URL for GitHub's raw content
const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com';

// Endpoint to fetch the JSON file
app.get('/get-session', async (req, res) => {
    // 1. Get the filename from the 'q' query parameter
    const filename = req.query.q;

    if (!filename) {
        return res.status(400).json({ error: 'Missing query parameter: q (e.g., ?q=file.json)' });
    }

    // 2. Construct the full path to the raw file
    // Format: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path/to/folder}/{filename}
    // We assume the main branch is 'main'. Adjust if necessary.
    const fileUrl = `${GITHUB_RAW_BASE_URL}/${REPO_OWNER}/${REPO_NAME}/main/${SESSION_FOLDER_PATH}/${filename}`;

    try {
        // 3. Use Axios to fetch the file content
        const response = await axios.get(fileUrl, {
            headers: {
                // Authentication using the PAT
                'Authorization': `token ${GITHUB_TOKEN}`,
                // GitHub requires a valid User-Agent
                'User-Agent': 'Express-GitHub-Fetcher', 
            },
            // Tell Axios to expect JSON data
            responseType: 'json', 
        });

        // 4. Send the fetched JSON data back to the client
        res.status(200).json(response.data);

    } catch (error) {
        console.error('GitHub Fetch Error:', error.message);

        // Check for specific GitHub-related errors
        if (error.response) {
            // 404 (Not Found) - File or repo not found
            if (error.response.status === 404) {
                return res.status(404).json({ 
                    error: 'File not found or path is incorrect.', 
                    path_attempted: fileUrl 
                });
            }
            // 401/403 (Unauthorized/Forbidden) - Token issue
            if (error.response.status === 401 || error.response.status === 403) {
                return res.status(403).json({ 
                    error: 'Authentication failed. Check your GITHUB_TOKEN and permissions.',
                    github_status: error.response.status
                });
            }
            
            // Other Axios/GitHub errors
            return res.status(error.response.status).json({ 
                error: 'Error fetching file from GitHub.', 
                details: error.response.data || 'Unknown error' 
            });
        }
        
        // Network or other generic error
        res.status(500).json({ error: 'Server error during fetch.', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Test endpoint: http://localhost:${port}/get-session?q=your_file_name.json`);
});
