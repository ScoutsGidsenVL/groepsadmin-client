pipeline {
  agent any

  options {
    buildDiscarder(logRotator(artifactNumToKeepStr: '10'))
  }

  stages {
    stage('build') {
      steps {
        sh "npm --production prune --ignore-scripts"
        sh "npm --production install --ignore-scripts"
        sh "node_modules/.bin/bower prune --production"
        sh "node_modules/.bin/bower install --production"
        sh "node_modules/.bin/grunt build"
        sh "(cd node_modules/aglio-theme-olio && ./scripts/setup-cache.js)"
        sh "node_modules/.bin/aglio --theme-condense-nav=false --theme-style default --theme-style docs/custom.less -i docs/api.apib -o docs/api.html"
        sh "rm -rf client.zip"
        /* jquery en keycloak apart is voor apitest.html */
        sh "zip -r client.zip index.html formulier.html apitest.html logintest.html app css data docs/api.html fonts img js less partials bower_components/jquery/jquery.js node_modules/keycloak-js/dist/keycloak.js"
      }
    }

    stage('archive') {
      when {
            anyOf {
                branch "production"
                branch "staging"
            }
      }
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
        sh 'ssh az-deb-mgmt sudo -u ansible /opt/deploy-ga.sh client ${BRANCH_NAME}'
      }
    }
  }

  post {
    failure {
      emailen()
    }
    unstable {
      emailen()
    }
    changed {
      emailen()
    }
  }
}

def emailen() {
  mail(
    to: "tvl@scoutsengidsenvlaanderen.be,${env.CHANGE_AUTHOR_EMAIL}",
    subject: "[Jenkins] ${currentBuild.fullDisplayName} ${currentBuild.currentResult}",
    body: """${currentBuild.fullDisplayName} ${currentBuild.currentResult}

${currentBuild.absoluteUrl}"""
  )
}
