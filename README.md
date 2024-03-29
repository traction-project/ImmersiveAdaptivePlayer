# TRACTION Immersive Adaptive Player

This repository contains the Immersive Adaptive Player code for the TRACTION EU-project.
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

<img src="https://www.traction-project.eu/wp-content/uploads/sites/3/2020/02/Logo-cabecera-Traction.png" align="left"/><em>This tool was originally developed as part of the <a href="https://www.traction-project.eu/">TRACTION</a> project, funded by the European Commission’s <a hef="http://ec.europa.eu/programmes/horizon2020/">Horizon 2020</a> research and innovation programme under grant agreement No. 870610.</em>

## Documentation

The documentation is available here: https://traction-project.github.io/ImmersiveAdaptivePlayer


## Deployment

Needed for installation:

* Apache Tomcat

How to use run the player with Apache Tomcat (some steps and directories may vary using XAMPP for Windows):

* Run C:\apache-tomcat\bin\startup.bat
* Open C:\apache-tomcat\webapps folder
* Copy the ImmersiveAdaptivePlayer folder into webapps folder (make sure the folder is named ImmersiveAdaptivePlayer, with no other characters and respecting the letters in capital)
* Your directory must be webapps\ImmersiveAdaptivePlayer\all-folders-files. Make sure there is not a subfolder also called ImmersiveAdaptivePlayer.
* Open a browser and type: "your_apache_server_address:portnumber"/ImmersiveAdaptivePlayer/ (portnumber is usually 8080 with Tomcat)


## Built With

* [IMSC_360.js](https://github.com/sandflow/imscJS) - JavaScript library for rendering IMSC Text and Image Profile documents in HTML5
* [three.js](https://threejs.org/)
* [DASH.js](https://github.com/Dash-Industry-Forum/dash.js/wiki) - Reference client implementation for the playback of DASH contents via JavaScript and compliant browsers.
* [Omnitone.js](https://github.com/GoogleChrome/omnitone) - Implementation of Ambisonic decoding and binaural rendering written in Web Audio Application Program Interface


## Acknowledgments

Based on the ImAc Player - github.com/ua-i2cat/ImAc

> M. Montagud, I. Fraile, E. Meyerson, M. Genís, S. Fernández, “ImAc Player: Enabling a Personalized Consumption of Accessible Immersive Content”, ACM TVX 2019, Manchester (UK), June 2019

Please, also cite us:

> A. A. Simiscuka, M. A. Togou, R. Verma, M. Zorrilla, N. E. O'Connor and G. -M. Muntean, "An Evaluation of 360° Video and Audio Quality in an Artistic-Oriented Platform," 2022 IEEE International Symposium on Broadband Multimedia Systems and Broadcasting (BMSB), 2022, pp. 1-5, doi: 10.1109/BMSB55706.2022.9828745.
