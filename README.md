# Resume Parser AI - Chatbot application

## Preface

In this Project, I Created a chatbot application which takes a file as an input and answers user's query. The goal of this application is to accurately provide answers based on the uploaded file. This application could be used as an assistant to quickly answer questions or summarize facts from files containing large amounts of text data, making our lives easier.

## Project structure

In this project you find 2 directories

1. `backend` containing the server side **python** code
2. `frontend` containing the client side **typescript** code.\
   In both these directories, it is your job to complete the missing modules and add necessary functionalities to make the app fully functional.

### Backend

**Requirements**: Python 3.10 or above. We will test your submission against Python 3.10.

1. `main.py` which is the entry point to our server
2. This project has a few Python packages as dependencies, you can install them in your virtual environment using `requirements.txt`. If you were to use other dependencies, then please add them to `requirements.txt`.
3. We will be using [`conda`](https://docs.conda.io/projects/conda/en/stable/) package manager to create a virtual environment `chatbot` using `conda create -n chatbot python=3.10` and then `conda activate chatbot` to activate the environment.
4. Then install the python packages using `pip install -r requirements.txt`

#### Running the backend server

To launch the server, navigate to the `backend` directory and run:

##### `uvicorn main:app --reload`

This will start the server at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### Frontend

The project structure within the `frontend` directory follows the official `create-react-app` structure as in the [docs](https://create-react-app.dev/docs/folder-structure). Some of the files have been removed for convenience & brevity.

**Requirements**: I am  using `node V20.11.1` and `npm 10.2.4`. They can be downloaded via [installer](https://nodejs.org/en). For more information check [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### How to launch the react app

1. Navigate to the `frontend` directory and run `npm install`
2. Then you can run:

   ##### `npm start`

   This will launch the app in development mode.\
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.
