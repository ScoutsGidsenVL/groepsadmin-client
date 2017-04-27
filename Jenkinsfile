pipeline {
  agent any

  stages {
    stage('build') {
      steps {
        sh "npm prune"
        sh "npm install"
        sh "node_modules/.bin/bower prune"
        sh "node_modules/.bin/bower install"
        sh "node_modules/.bin/grunt wiredep"
        sh "node_modules/.bin/grunt less"
        sh "node_modules/.bin/aglio --theme-condense-nav=false -i docs/api.apib -o docs/api.html"
        sh "rm -rf client.zip"
        sh "zip -r client.zip index.html apitest.html logintest.html app bower_components css data fonts img js less"
      }
    }

    stage('archive') {
      steps {
        archive "client.zip"
      }
    }

    stage('deploy') {
      steps {
        sshagent(credentials: ['jenkins']) {
          sh "scripts/deploy_jenkins.sh ${BRANCH_NAME}"
        }
      }
    }
  }

  post {
    failure {
      mail(
        to:"tvl@scoutsengidsenvlaanderen.be",
        subject:"[Jenkins] Failure: ${currentBuild.fullDisplayName}",
        body: "Build failed"
      )
    }
    unstable {
      mail(
        to:"tvl@scoutsengidsenvlaanderen.be",
        subject:"[Jenkins] Unstable: ${currentBuild.fullDisplayName}",
        body: "Build unstable"
      )
    }
    changed {
      mail(
        to:"tvl@scoutsengidsenvlaanderen.be",
        subject:"[Jenkins] Changed: ${currentBuild.fullDisplayName}",
        body: "Build changed"
      )
    }
  }
}
