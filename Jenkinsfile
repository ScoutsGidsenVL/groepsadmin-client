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
        /* jquery en keycloak apart is voor apitest.html */
        sh "zip -r client.zip index.html apitest.html logintest.html app css data docs/api.html fonts img js less partials bower_components/jquery/jquery.js bower_components/keycloak/dist/keycloak.js"
      }
    }

    stage('archive') {
      steps {
        archive 'client.zip'

        script{
            def artifactory = Artifactory.server 'artifactory'

            def uploadSpec = '''{
              "files": [
                {
                  "pattern": "client.zip",
                  "target": "groepsadmin-client/${BRANCH_NAME}/${BUILD_ID}/"
                }
             ]
            }'''

            def buildInfo = artifactory.upload spec: uploadSpec

            artifactory.publishBuildInfo buildInfo
        }
      }
    }

    stage('deploy') {
      steps {
        sh 'ssh lxc-deb-rundeck.vvksm.local sudo -u rundeck /opt/deploy-ga.sh ${BRANCH_NAME}'
      }
    }
  }

  post {
    failure {
      mail(
        to: "tvl@scoutsengidsenvlaanderen.be",
        subject: "[Jenkins] Failure: ${currentBuild.fullDisplayName}",
        body: "Build failed"
      )
    }
    unstable {
      mail(
        to: "tvl@scoutsengidsenvlaanderen.be",
        subject: "[Jenkins] Unstable: ${currentBuild.fullDisplayName}",
        body: "Build unstable"
      )
    }
    changed {
      mail(
        to: "tvl@scoutsengidsenvlaanderen.be",
        subject: "[Jenkins] Changed: ${currentBuild.fullDisplayName}",
        body: "Build changed"
      )
    }
  }
}
