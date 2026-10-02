pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                // Pulls the latest code from the main branch of the repo
                git branch: 'main',
                    url: 'https://github.com/Sarita1901/flo-automation-workshop.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Clean install from package-lock.json (fails if lockfile is out of sync)
                bat 'npm ci'
            }
        }

        stage('Install Playwright Chromium') {
            steps {
                // Downloads only the Chromium browser binary used by the suite
                bat 'npx playwright install chromium'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                // Runs the 6 existing tests; a non-zero exit code fails this stage
                bat 'npx playwright test'
            }
        }
    }

    post {
        always {
            // Always archive the HTML report, whether tests passed or failed,
            // so it's downloadable/viewable from the Jenkins build page.
            archiveArtifacts artifacts: 'playwright-report/**',
                              allowEmptyArchive: true,
                              fingerprint: true
        }
    }
}
