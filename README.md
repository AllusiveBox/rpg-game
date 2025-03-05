# Getting Started

1. This project runs locally through the use of `azurite`. 
   1. This can be installed locally via `npm install -g azurite` and ran via the following script:
      `azurite --silent --location c:\azurite --debug c:\azurite\debug.log`.
2. In addition to `azurite`, you'll need to ensure that you have the current Azure Functions Core Tools version installed as well.
   1. This can be installed following the instructions on [this Microsoft Article](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-node?tabs=windows%2Cazure-cli%2Cbrowser&pivots=nodejs-model-v4#install-the-azure-functions-core-tools).
3. Ensure all dependencies are installed locally.
4. Lastly, you'll need to have a `local.settings.json` file locally. This will hold all the environment variables that are loaded in when the project starts. The basic structure should look like this:
   ```JSON
    {
        "IsEncrypted": false,
        "Values": {
            "AzureWebJobsStorage": "UseDevelopmentStorage=true",
            "FUNCTIONS_WORKER_RUNTIME": "node"
        }
    }
   ```
   
# Running Locally

The project can run locally by running the npm script `npm start`. Ensure that the `local.settings.json` file is properly set up first, or the project will not be able to run successfully.