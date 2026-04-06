from fastapi.testclient import TestClient

from server.main import create_app


def test_health_endpoint() -> None:
    app = create_app()

    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
