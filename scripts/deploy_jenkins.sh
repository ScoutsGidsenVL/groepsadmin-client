#!/usr/bin/env bash

BRANCH=${1}
case "${BRANCH}" in
  '')
    >&2 echo Geen branch opgegeven
    exit 1
    ;;
  'tvl/dev')
    DEPLOY_HOST='192.168.1.137'
    ;;
  'staging')
    DEPLOY_HOST='185.41.237.134'
    ;;
  'production')
    DEPLOY_HOST='groepsadmin.scoutsengidsenvlaanderen.be'
    ;;
  *)
    echo "De branch '${BRANCH}' wordt niet gedeployed."
    exit 0
    ;;
esac

scp -o PreferredAuthentications=publickey client.zip jenkins@${DEPLOY_HOST}:/home/jenkins/
ssh -o PreferredAuthentications=publickey -l jenkins ${DEPLOY_HOST} sudo /root/scripts/groepsadmin/deploy-groepsadmin-client-by-jenkins.sh
