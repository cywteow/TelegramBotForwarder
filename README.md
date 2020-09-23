# Overview

I worked in an environment in Singapore where I can't bring my phone to the office. There are times where I need to access my OTPs, email notification and wechat messages. My wife also uses my credit card to make online purchases so she need my OTPs as well. So I wrote this script to forward the infomation I needed to my microservice and it will send it to my telegram bot to notify me on my internet PC in office and also forward the OTP to my wife via telegram bot. This is a google web apps script. I deployed it in one of my google spreadsheet.

## Requirement

1. Tasker & AutoNotification (From play store)
2. Google spreadsheet (to deploy your web apps)
3. Telegram Bot (Send messages to you on telegram)

## How it works
1) You can configure tasker to do a rest API call to your web apps that is hosted on google spreadsheet when it receive any notifications.
2) Your web apps will process the logic and do some filtering then call telegram bot api to forward the notification to you via your telegram chatid


