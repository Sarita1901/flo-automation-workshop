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
            // Build the plain static summary.html from the JSON results
            // (skipped safely if results.json doesn't exist, e.g. an earlier
            // stage failed before tests ran).
            bat '''
                if exist test-results\\results.json (
                    npm run report:summary
                ) else (
                    echo No results.json found, skipping summary report.
                )
            '''

            // Always archive the reports, whether tests passed or failed,
            // so they're downloadable/viewable from the Jenkins build page.
            archiveArtifacts artifacts: 'playwright-report/**, test-results/summary.html',
                              allowEmptyArchive: true,
                              fingerprint: true
        }
    }
}
