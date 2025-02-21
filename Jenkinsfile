pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'randomthoughtsbot'
        DOCKER_TAG = 'latest'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }

        stage('Deploy') {
            steps {
                sh "docker stop ${DOCKER_IMAGE} || true"
                sh "docker rm ${DOCKER_IMAGE} || true"
                sh "docker run -d --name ${DOCKER_IMAGE} --env-file .env ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
    }

    post {
        failure {
            echo 'Pipeline failed! Sending notification...'
        }
    }
}
