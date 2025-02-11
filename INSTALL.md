  Project Installation and Setup

Project Installation and Setup
==============================

This guide provides instructions for setting up and testing the project using Docker and Docker Compose. Follow the steps below to get your development environment up and running smoothly.

Prerequisites
-------------

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)
*   (Optional) [Python 3.11](https://www.python.org/downloads/) and [pytest 7.4.4](https://docs.pytest.org/) for testing the API
*   (Optional) [Node.js](https://nodejs.org/en/download/) and [npm](https://docs.npmjs.com/cli/v7/commands/npm) for frontend testing

Installation
------------

1.  **Clone the Repository:**
    
        git clone <repository-url>
        cd <repository-folder>
    
2.  **Create a .env File:**
    
    Before running the Docker command, create a `.env` file in the `api` folder with the following structure:
    
        ATLAS_URI=
        DB_NAME=cookbook
        GROQ_API_KEY=
    
3.  **Start the Services:**
    
    Make sure Docker and Docker Compose are installed, then run the following command in the project root:
    
        docker compose up --build -d
    
    This command will:
    
    *   Build the images
    *   Start the backend and frontend services in detached mode
4.  **Access the Application:**
    
    Once the services are up, you can start development right away. Access the frontend and backend as needed from your Docker setup.
    

Testing the API
---------------

To test the API, you'll need to install Python and pytest.

### Steps:

1.  **Install Python 3.11 and pytest:**
    
    Make sure you have Python 3.11 installed, and set up a virtual environment (recommended) to manage dependencies:
    
        python3.11 -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        pip install pytest==7.4.4
    
2.  **Run Tests:**
    
    From the root directory, run the following command to execute all API tests:
    
        pytest tests/test_api.py
    
    This will run all tests in `tests/test_api.py` to verify the API is functioning correctly.
    

Frontend Testing
----------------

To test the frontend, you will need to have Node.js and npm installed.

### Steps:

1.  **Install Node.js and npm:**
    
    Follow the instructions on the [Node.js website](https://nodejs.org/en/download/) to install Node.js, which includes npm.
    
2.  **Install Dependencies:**
    
    Navigate to the frontend folder and run the following command to install dependencies:
    
        npm install
    
3.  **Run Tests:**
    
    After installing the dependencies, run the following command to execute the frontend tests:
    
        npm test
    

Additional Notes
----------------

*   To stop the Docker services, run:
    
        docker compose down
    
*   To view logs for debugging, use:
    
        docker compose logs -f