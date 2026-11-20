pipeline {
  agent { label 'nutriguide-ci' }

  options {
    skipDefaultCheckout(true)
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 60, unit: 'MINUTES')
  }

  triggers {
    githubPush()
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Check toolchain') {
      steps {
        script {
          if (isUnix()) {
            sh 'node --version && npm --version'
          } else {
            bat 'node --version && npm.cmd --version'
          }
        }
      }
    }

    stage('Install dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm.cmd ci'
          }
        }
      }
    }

    stage('Install Playwright Chromium') {
      steps {
        script {
          if (isUnix()) {
            sh 'npx playwright install chromium'
          } else {
            bat 'npx.cmd playwright install chromium'
          }
        }
      }
    }

    stage('Contracts, reporter and type checks') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run test:reporter && npm run test:contracts && npx tsc -p tests/tsconfig.json'
          } else {
            bat 'npm.cmd run test:reporter && npm.cmd run test:contracts && npx.cmd tsc -p tests/tsconfig.json'
          }
        }
      }
    }

    stage('Documentation inventory') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run docs:update && npm run docs:check'
          } else {
            bat 'npm.cmd run docs:update && npm.cmd run docs:check'
          }
        }
      }
    }

    stage('Full Playwright regression') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run test:all'
          } else {
            bat 'npm.cmd run test:all'
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**,test-results/**,test-reports/**', allowEmptyArchive: true, fingerprint: true
    }
  }
}
