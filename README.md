<!-- Wrike Tasks Integration -->

This project is a simple Node.js script that fetches tasks from the Wrike API and saves them to a JSON file.

Features:
    Fetches tasks from Wrike APi
    Saves task data to a JSON file
    Uses TypeScript for type safety

Setup:

1.Clone the repository
    git clone <repository-url>
    cd <repository-folder>

2. install dependencies:
    npm install

3. Create a .env file in the root directory and add your Wrike API token:
    WRIKE_API_TOKEN=your_wrike_api_token_here

Run the script:
    npm start

    This will fetch tasks from Wrike and save them to tasks.json.

Configuration
    The API endpoint is set to: https://www.wrike.com/api/v4/tasks
    The response includes responsibleIds and parentIds for tasks.
    The output file is tasks.json.

    If the script fails, check the console logs for error messages.

