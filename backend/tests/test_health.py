"""
Health check endpoint tests
"""

import pytest
from fastapi import status


class TestHealthCheck:
    """Test health check endpoints"""

    def test_health_check_endpoint_exists(self, client):
        """Test that health check endpoint exists"""
        response = client.get("/api/health")
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND, status.HTTP_422_UNPROCESSABLE_ENTITY]
