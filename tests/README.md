# Running Tests for CookBook Project

This document provides instructions for running the test suite for the CookBook project.

## Prerequisites

Before running the tests, make sure you have all the required dependencies installed:

```bash
pip3 install -r ../api/requirements.txt
```

## Running Backend Tests

### Running All Tests

To run all the backend tests:

```bash
python3 -m pytest -v
```

The `-v` flag provides verbose output showing each test case.

### Running Specific Test Files

To run a specific test file:

```bash
python3 -m pytest -v test_recipe_endpoints.py
```

### Running Tests with Coverage

To generate a coverage report:

```bash
python3 -m pytest --cov=../api
```

For a more detailed coverage report showing which lines are not covered:

```bash
python3 -m pytest --cov=../api --cov-report=term-missing
```

### Running Only Specific Tests

You can use the `-k` flag to run only tests that match a certain expression:

```bash
# Run only tests that have "recipe" in their name
python3 -m pytest -k "recipe" -v
```

## Common Issues and Solutions

1. **Import Errors**: If you encounter import errors, ensure your PYTHONPATH includes the project root:

```bash
PYTHONPATH=/path/to/Project3 python3 -m pytest
```

2. **Async Errors**: Our tests use pytest-asyncio for handling async functions. Make sure you have it installed and are using the `@pytest.mark.asyncio` decorator for async test functions.

3. **Mock Database**: The tests mock the MongoDB database. If you see "TypeError: object MagicMock can't be used in 'await' expression", make sure you're using AsyncMock for all async methods.

## Frontend Tests

To run the frontend tests:

```bash
cd ../frontend
npm test
```

For running tests with coverage:

```bash
cd ../frontend
npm test -- --coverage
```

## Continuous Integration

The tests are automatically run in GitHub Actions when code is pushed to the repository. Check the GitHub Actions tab in the repository for test results. 