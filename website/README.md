#NEXORA Robotics Website

This directory contains the frontend website for NEXORA Robotics, a fictional humanoid robotics company.

#Objectives

- Create a modern, responsive business website.
- Showcase fictional humanoid robot products.
- Provide interactive product information and customer inquiry features.
- Deploy the website using GitHub Pages.
- Load the deployed website inside an Android application using WebView.

#Technologies

- HTML
- CSS
- JavaScript
- Git and GitHub
- GitHub Pages

# Deployment and app updates

The GitHub Actions workflow tags the stylesheet and JavaScript URLs with the
deployment commit SHA. This gives each deployment new asset URLs, preventing
the app's WebView from reusing cached CSS or JavaScript from an earlier
deployment. The Android app also requests a fresh page when it opens or
returns to the foreground.

#Development Status

Project structure initialized. Website implementation is pending.