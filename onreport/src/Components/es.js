{
    "id": "g-4377ed64-c3e4-4d24-9347-5a17cf8a24d8",
    "rules": [
      {
        "id": "r-eecb5005-8dea-4466-9d15-af3d6d1498ed",
        "field": "firstName",
        "value": "12",
        "operator": "="
      },
      {
        "id": "r-ccfb5c86-ccde-4636-ab0d-1a7d8ac4cf7a",
        "field": "age",
        "value": "12",
        "operator": "<"
      },
      {
        "id": "g-b0d66983-ab0a-4e98-86d3-74b4a1ff817e",
        "rules": [
          {
            "id": "r-54061dec-4994-466c-826c-837266275e42",
            "field": "firstName",
            "value": "12",
            "operator": "<"
          },
          {
            "id": "r-66a3bfc9-0d3c-44b6-9c02-c0f5996eb226",
            "field": "firstName",
            "value": "12",
            "operator": "<"
          },
          {
            "id": "g-dcdcacd0-de39-4653-b2c0-68016da17741",
            "rules": [
              {
                "id": "r-41d16a28-761e-4a48-888e-c30bc2c1e1d1",
                "field": "firstName",
                "value": "121",
                "operator": ">"
              }
            ],
            "combinator": "and"
          }
        ],
        "combinator": "and"
      }
    ],
    "combinator": "and"
  }