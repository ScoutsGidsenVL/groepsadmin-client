pipeline {
  agent any

  stages {
    stage('build') {
      steps {
        sh "npm --production prune"
        sh "npm --production install"
        sh "node_modules/.bin/bower prune --production"
        sh "node_modules/.bin/bower install --production"
        sh "node_modules/.bin/grunt less bower_concat copy"
        sh "node_modules/.bin/aglio --theme-condense-nav=false --theme-style default --theme-style docs/custom.less -i docs/api.apib -o docs/api.html"
        sh "rm -rf client.zip"
        sh "zip -r client.zip index.html apitest.html logintest.html app css data docs/api.html fonts img js less partials"
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
