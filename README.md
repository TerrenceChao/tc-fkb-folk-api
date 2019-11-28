# fkb-folk-api

This project is one of the services of the Messenger framework.

## Package and Tool
There are some packages and tools you need to install:
  * PostgreSQL: v11.5
  * MongoDB: v4.2.0
  * Redis: >= v5.0
  * RabbitMQ: v3.8.0
  * Elasticsearch: v7.1.0
 
You can check the official sites about them If there are any problems during installation. I use homebrew to install most of them. It depends on your OS system.
About Elasticsearch, I will use Amazon Elasticsearch Service (AES) instead of in the feature. The latest version on AWS is v7.1.0 since I checked a month ago (10/2019). I just install Elasticsearch for local testing without full-stack (ELK stack).
Just start all of them after the installations are finished.

## Binding
There are 3 projects in total called `fkb-message-api`, `fkb-notify-api`, `fkb-folk-api`, which are play roles respectively as socket communication between clients (`fkb-message-api`), push notifications (`fkb-notify-api`) and main storage of users' data ( `fkb-folk-api`). There are some configurations you need to bind with. You can refer to `.env.example` file:
  * fkb-message-api
    * Redis: check the config name start with `ADAPTOR_` for Redis.
    * MongoDB: check the config name start with `MONGODB`.
  * fkb-notify-api
    * Elasticsearch: `ELASTICSEARCH_HOST`.
    * fkb-message-api: `MESSAGING_DOMAIN` and `MESSAGING_PATH_PUSH` (make the connection with `fkb-message-api`).
    * email vendor: `EMAIL_VENDOR`. There are three options in total called `ses`, `mailgun`, `logger` about  `EMAIL_VENDOR`. I use `ses` (Amazon Simple Email Service) or `mailgun` here to play roles as email vendors, but if you just want to make sure the `notify-api` are called correctly, maybe you wanna use `logger` to print the result out only.
    * RabbitMQ: check the config names called `MQ_VENDOR`, `RABBITMQ_HOSTS` for RabbitMQ.
  * fkb-folk-api
    * PostgreSQL: check the config name start with `SQL_`.
    * fkb-message-api: `MESSAGING_DOMAIN` and `MESSAGING_PATH_AUTHENTICATE` (make the connection with `fkb-message-api`)
    * fkb-notify-api: `NOTIFICATION_DOMAIN` and `NOTIFICATION_PATH_PUBLISH` (make the connection with `fkb-notify-api`)
    * Redis: check the config name start with `REDIS_`.

## Run
Run these 3 projects in the above order (message-api, notify-api, folk-api) by `npm run start` in your terminal (command window).

## Feature Test
Finally, you have to exam the functionalities are all run correctly. The testing scripts written in postman are placed in the folder fkb-folk-api/public/postman. You can find there are two scripts, one for env params (fakebook.local-env.json), the other is the major feature test script (folk-api-feature-test.json). Run `newman run folk-api-feature-test.json -e fakebook.local-env.json` while you are using newman. Of course, you can use postman instead.

In order to sure the robustness, there are four test cases as following:

1. all services are started and do testing.
2. assume `fkb-message-api` runs failure, stop `fkb-message-api` and run the command mentioned above, again.
3.  assume `fkb-notify-api` runs failure, stop it and do testing.
4. assume both `fkb-message-api` and `fkb-notify-api` run failure, stop both of them and do testing.

## In the Future
I am sure it works well if the configurations are correct. The next milestone is the deployment.