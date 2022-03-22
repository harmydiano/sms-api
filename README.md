# The sms API

## Description
Api web service for inbound & outbound

## Local Setup

### Requirements

- Ensure you have Node.JS and MSQL DB, REDIS installed on your system

### Getting Started
- Clone the repository `git clone  git@github.com:harmydiano/sms-api.git`
- Change into the directory `cd sms-api`
- Change into the directory `cd inbound / outbound`
- Install all required dependencies with `npm install`
- Start the application with `npm run dev`
- Run test with `npm run test`
- Ensure you have redis started

### Documentation
- https://documenter.getpostman.com/view/4900546/UVsQtjPh

- Run the postman collection on your postman device
- Import the enviromental variables.

- INBOUND BASE_URL LOCAL = http://localhost:3012/api/v1
- OUTBOUND BASE_URL LOCAL = http://localhost:3013/api/v1

- INBOUND BASE_URL LIVE = http://54.162.9.165:3012/api/v1
- OUTBOUND BASE_URL LIVE = http://54.162.9.165:3013/api/v1


