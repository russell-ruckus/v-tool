# Database Schema

MVP uses client-only storage (localStorage). Presenting JSON Schemas for data integrity and future portability.

Scene JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://v-tool.app/schema/scene.schema.json",
  "title": "Scene",
  "type": "object",
  "required": ["id", "version", "rng", "shape", "distribution", "transform", "style", "view", "viewport", "export"],
  "properties": {
    "id": { "type": "string" },
    "version": { "type": "string" },
    "rng": {
      "type": "object",
      "required": ["seed"],
      "properties": { "seed": { "type": "integer" } }
    },
    "shape": {
      "oneOf": [
        {
          "type": "object",
          "required": ["type", "shape"],
          "properties": {
            "type": { "const": "basic" },
            "shape": { "enum": ["square", "circle", "triangle"] }
          }
        },
        {
          "type": "object",
          "required": ["type", "symbolId", "viewBox"],
          "properties": {
            "type": { "const": "uploaded" },
            "symbolId": { "type": "string" },
            "viewBox": {
              "type": "array",
              "items": { "type": "number" },
              "minItems": 4,
              "maxItems": 4
            }
          }
        }
      ]
    },
    "distribution": {
      "oneOf": [
        {
          "type": "object",
          "required": ["mode", "path", "spacing"],
          "properties": {
            "mode": { "const": "path" },
            "spacing": { "enum": ["linear", "ease-in", "ease-out"] },
            "path": {
              "type": "object",
              "required": ["type", "instances"],
              "properties": {
                "type": { "enum": ["linear", "sine"] },
                "instances": { "type": "integer", "minimum": 0 },
                "frequency": { "type": "number" },
                "amplitude": { "type": "number" }
              }
            }
          }
        },
        {
          "type": "object",
          "required": ["mode", "particle"],
          "properties": {
            "mode": { "const": "particle" },
            "particle": {
              "oneOf": [
                {
                  "type": "object",
                  "required": ["type", "density", "jitter"],
                  "properties": {
                    "type": { "const": "grid" },
                    "density": { "type": "number", "minimum": 0 },
                    "jitter": { "type": "number", "minimum": 0, "maximum": 1 }
                  }
                },
                {
                  "type": "object",
                  "required": ["type", "density"],
                  "properties": {
                    "type": { "const": "random" },
                    "density": { "type": "number", "minimum": 0 }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    "transform": {
      "type": "object",
      "required": ["depthRange", "scaleRange", "rotation", "sortByDepth"],
      "properties": {
        "depthRange": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 2 },
        "scaleRange": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 2 },
        "rotation": {
          "type": "object",
          "required": ["mode"],
          "properties": {
            "mode": { "enum": ["fixed", "range"] },
            "value": { "type": "number" },
            "min": { "type": "number" },
            "max": { "type": "number" }
          }
        },
        "sortByDepth": { "type": "boolean" }
      }
    },
    "style": {
      "type": "object",
      "required": ["fill", "stroke", "strokeWidth", "background"],
      "properties": {
        "fill": { "type": "string" },
        "stroke": { "type": "string" },
        "strokeWidth": { "type": "number", "minimum": 0 },
        "background": { "type": "string" }
      }
    },
    "view": {
      "type": "object",
      "required": ["pan", "zoom", "overlayVisible"],
      "properties": {
        "pan": {
          "type": "object",
          "required": ["x", "y"],
          "properties": {
            "x": { "type": "number" },
            "y": { "type": "number" }
          }
        },
        "zoom": { "type": "number", "minimum": 0.1, "maximum": 10 },
        "overlayVisible": { "type": "boolean" }
      }
    },
    "viewport": {
      "type": "object",
      "required": ["aspect", "orientation", "width"],
      "properties": {
        "aspect": { "enum": ["16:9", "1:1", "4:3"] },
        "orientation": { "enum": ["landscape", "portrait"] },
        "width": { "type": "integer", "minimum": 1 }
      }
    },
    "export": {
      "type": "object",
      "required": ["precision", "useSymbols", "clipToViewport"],
      "properties": {
        "precision": { "type": "integer", "minimum": 0 },
        "useSymbols": { "const": true },
        "clipToViewport": { "const": true }
      }
    }
  }
}
```

Preset JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://v-tool.app/schema/preset.schema.json",
  "title": "Preset",
  "type": "object",
  "required": ["id", "name", "scene", "createdAt"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "scene": { "$ref": "scene.schema.json" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```
