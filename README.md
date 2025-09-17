# DevOps-EventNet

setting up cypress:
cd client
npx cypress open

setting up jenkins:
brew services start jenkins - will open port 8080
cd server
you make a push, its automated via webhooks
make sure you port forward now because you know to add payload url on github webhooks, https://d483bbcbd93a.ngrok-free.app/github-webhook/

