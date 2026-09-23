// GENERATED. Change definition.mjs and rebuild in freedom-platform.
export const protocol={
  "version": "freedom.preview/v1",
  "revision": "0.2.0",
  "api_prefix": "/api/v1",
  "operations": {
    "getProtocol": {
      "method": "GET",
      "path": "/protocol",
      "response": "Protocol",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": false,
      "idempotent": false
    },
    "getHealth": {
      "method": "GET",
      "path": "/health",
      "response": "Health",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": false,
      "idempotent": false
    },
    "login": {
      "method": "POST",
      "path": "/auth/login",
      "response": "Session",
      "body": "Login",
      "concurrency": "none",
      "status": 200,
      "auth": false,
      "idempotent": false
    },
    "logout": {
      "method": "POST",
      "path": "/auth/logout",
      "response": "LoggedOut",
      "body": "Empty",
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "getSession": {
      "method": "GET",
      "path": "/session",
      "response": "Session",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "getPositioning": {
      "method": "GET",
      "path": "/me/positioning",
      "response": "Positioning",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "savePositioning": {
      "method": "POST",
      "path": "/me/positioning",
      "response": "Profile",
      "body": "SavePositioning",
      "concurrency": "optional",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "listCareerTracks": {
      "method": "GET",
      "path": "/career-tracks",
      "response": "TrackList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "listGuilds": {
      "method": "GET",
      "path": "/guilds",
      "response": "GuildList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "joinGuild": {
      "method": "POST",
      "path": "/guilds/{key}/join",
      "response": "Membership",
      "body": "Empty",
      "concurrency": "optional",
      "status": 200,
      "auth": true,
      "idempotent": true
    },
    "leaveGuild": {
      "method": "POST",
      "path": "/guilds/{key}/leave",
      "response": "Membership",
      "body": "Empty",
      "concurrency": "required",
      "status": 200,
      "auth": true,
      "idempotent": true
    },
    "listSupplierProducts": {
      "method": "GET",
      "path": "/supplier/products",
      "response": "ProductList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "createSupplierProduct": {
      "method": "POST",
      "path": "/supplier/products",
      "response": "Product",
      "body": "ProductInput",
      "concurrency": "none",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "createSupplierOffer": {
      "method": "POST",
      "path": "/supplier/products/{id}/offer-versions",
      "response": "Product",
      "body": "OfferInput",
      "concurrency": "required",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "listCatalog": {
      "method": "GET",
      "path": "/retail/catalog",
      "response": "ProductList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "listStores": {
      "method": "GET",
      "path": "/retail/stores",
      "response": "StoreList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "createStore": {
      "method": "POST",
      "path": "/retail/stores",
      "response": "Store",
      "body": "StoreInput",
      "concurrency": "none",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "listListings": {
      "method": "GET",
      "path": "/retail/listings",
      "response": "ListingList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "createListing": {
      "method": "POST",
      "path": "/retail/listings",
      "response": "Listing",
      "body": "ListingInput",
      "concurrency": "none",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "requestSupply": {
      "method": "POST",
      "path": "/retail/listings/{id}:request-supply",
      "response": "Listing",
      "body": "SnapshotInput",
      "concurrency": "required",
      "status": 200,
      "auth": true,
      "idempotent": true
    },
    "listSupplyRequests": {
      "method": "GET",
      "path": "/supplier/requests",
      "response": "AcceptanceList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "decideSupplyRequest": {
      "method": "POST",
      "path": "/supplier/requests/{id}:decide",
      "response": "Acceptance",
      "body": "DecisionInput",
      "concurrency": "required",
      "status": 200,
      "auth": true,
      "idempotent": true
    },
    "listProjects": {
      "method": "GET",
      "path": "/opensource/projects",
      "response": "ProjectList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "importProject": {
      "method": "POST",
      "path": "/opensource/projects",
      "response": "Project",
      "body": "ProjectInput",
      "concurrency": "none",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "refreshProject": {
      "method": "POST",
      "path": "/opensource/projects/{id}:refresh",
      "response": "Project",
      "body": "Empty",
      "concurrency": "required",
      "status": 200,
      "auth": true,
      "idempotent": true
    },
    "reviseProject": {
      "method": "POST",
      "path": "/opensource/projects/{id}:revise",
      "response": "Project",
      "body": "ProjectMetadata",
      "concurrency": "required",
      "status": 200,
      "auth": true,
      "idempotent": true
    },
    "listCampaigns": {
      "method": "GET",
      "path": "/marketing/campaigns",
      "response": "CampaignList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "createCampaign": {
      "method": "POST",
      "path": "/marketing/campaigns",
      "response": "Campaign",
      "body": "CampaignInput",
      "concurrency": "none",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "reviseCampaign": {
      "method": "POST",
      "path": "/marketing/campaigns/{id}:revise",
      "response": "Campaign",
      "body": "CampaignMetadata",
      "concurrency": "required",
      "status": 200,
      "auth": true,
      "idempotent": true
    },
    "recordShare": {
      "method": "POST",
      "path": "/marketing/campaigns/{id}/shares",
      "response": "Campaign",
      "body": "ShareInput",
      "concurrency": "required",
      "status": 201,
      "auth": true,
      "idempotent": true
    },
    "listWorks": {
      "method": "GET",
      "path": "/work-items",
      "response": "WorkList",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    },
    "getDashboard": {
      "method": "GET",
      "path": "/dashboard",
      "response": "Dashboard",
      "body": null,
      "concurrency": "none",
      "status": 200,
      "auth": true,
      "idempotent": false
    }
  },
  "schemas": {
    "Protocol": {
      "type": "object",
      "properties": {
        "protocol": {
          "const": "freedom.preview/v1"
        },
        "revision": {
          "type": "string",
          "minLength": 1,
          "maxLength": 30
        },
        "protocol_sha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "operations": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          }
        },
        "authentication": {
          "const": "member_session_csrf"
        },
        "external_job_execution": {
          "const": false
        },
        "public_checkout": {
          "const": false
        }
      },
      "required": [
        "protocol",
        "revision",
        "protocol_sha256",
        "operations",
        "authentication",
        "external_job_execution",
        "public_checkout"
      ],
      "additionalProperties": true
    },
    "Empty": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "Problem": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "status": {
          "type": "integer",
          "minimum": 400,
          "maximum": 599
        },
        "code": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100
        },
        "detail": {
          "type": "string",
          "minLength": 0,
          "maxLength": 20000
        }
      },
      "required": [
        "type",
        "title",
        "status",
        "code",
        "detail"
      ],
      "additionalProperties": true
    },
    "Health": {
      "type": "object",
      "properties": {
        "status": {
          "const": "ok"
        },
        "mode": {
          "enum": [
            "local",
            "staging"
          ]
        },
        "version": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100
        },
        "money_movement_enabled": {
          "const": false
        },
        "official": {
          "const": false
        }
      },
      "required": [
        "status",
        "mode",
        "version",
        "money_movement_enabled",
        "official"
      ],
      "additionalProperties": true
    },
    "Login": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "password": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        }
      },
      "required": [
        "email",
        "password"
      ],
      "additionalProperties": false
    },
    "Session": {
      "type": "object",
      "properties": {
        "user": {
          "type": "object",
          "properties": {
            "user_id": {
              "type": "string",
              "format": "uuid"
            },
            "email": {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            "display_name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            }
          },
          "required": [
            "user_id",
            "email",
            "display_name"
          ],
          "additionalProperties": true
        },
        "csrf_token": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        }
      },
      "required": [
        "user",
        "csrf_token"
      ],
      "additionalProperties": true
    },
    "LoggedOut": {
      "type": "object",
      "properties": {
        "logged_out": {
          "const": true
        }
      },
      "required": [
        "logged_out"
      ],
      "additionalProperties": false
    },
    "SavePositioning": {
      "type": "object",
      "properties": {
        "real_world_occupations": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "maxItems": 8
        },
        "background": {
          "type": "string",
          "minLength": 0,
          "maxLength": 1200
        },
        "strengths": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "maxItems": 12
        },
        "goals": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "weekly_minutes": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10080
        },
        "desired_roles": {
          "type": "array",
          "items": {
            "enum": [
              "supplier",
              "seller",
              "creator",
              "promoter",
              "helper"
            ]
          },
          "maxItems": 5
        },
        "selected_tracks": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "maxItems": 3
        },
        "confirmed": {
          "const": true
        }
      },
      "required": [
        "real_world_occupations",
        "background",
        "strengths",
        "goals",
        "weekly_minutes",
        "desired_roles",
        "selected_tracks",
        "confirmed"
      ],
      "additionalProperties": false
    },
    "Profile": {
      "type": "object",
      "properties": {
        "profile_id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "source": {
          "const": "self_declared"
        },
        "goals": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        }
      },
      "required": [
        "profile_id",
        "user_id",
        "aggregate_version",
        "source",
        "goals"
      ],
      "additionalProperties": true
    },
    "Positioning": {
      "type": "object",
      "properties": {
        "profile": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/Profile"
            },
            {
              "type": "null"
            }
          ]
        },
        "tracks": {
          "type": "array",
          "items": {
            "type": "object"
          }
        },
        "recommendations": {
          "type": "array",
          "items": {
            "type": "object"
          }
        }
      },
      "required": [
        "profile",
        "tracks",
        "recommendations"
      ],
      "additionalProperties": false
    },
    "Guild": {
      "type": "object",
      "properties": {
        "guild_key": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "membership": {
          "anyOf": [
            {
              "type": "object"
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "required": [
        "guild_key",
        "name",
        "membership"
      ],
      "additionalProperties": true
    },
    "Membership": {
      "type": "object",
      "properties": {
        "membership_id": {
          "type": "string",
          "format": "uuid"
        },
        "state": {
          "enum": [
            "active",
            "left"
          ]
        },
        "rank": {
          "const": "runner"
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        }
      },
      "required": [
        "membership_id",
        "state",
        "rank",
        "aggregate_version"
      ],
      "additionalProperties": true
    },
    "ProductInput": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "photo_url": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "specifications": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "net_price_minor": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100000000000
        },
        "currency": {
          "enum": [
            "TWD",
            "USD"
          ]
        },
        "availability": {
          "enum": [
            "finite",
            "manual_confirmation"
          ]
        },
        "stock": {
          "anyOf": [
            {
              "type": "integer",
              "minimum": 0,
              "maximum": 100000000
            },
            {
              "type": "null"
            }
          ]
        },
        "shipping_terms": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1500
        },
        "return_terms": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1500
        }
      },
      "required": [
        "title",
        "specifications",
        "net_price_minor",
        "currency",
        "availability",
        "stock",
        "shipping_terms",
        "return_terms"
      ],
      "additionalProperties": false
    },
    "OfferInput": {
      "type": "object",
      "properties": {
        "net_price_minor": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100000000000
        },
        "currency": {
          "enum": [
            "TWD",
            "USD"
          ]
        },
        "availability": {
          "enum": [
            "finite",
            "manual_confirmation"
          ]
        },
        "stock": {
          "anyOf": [
            {
              "type": "integer",
              "minimum": 0,
              "maximum": 100000000
            },
            {
              "type": "null"
            }
          ]
        },
        "shipping_terms": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1500
        },
        "return_terms": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1500
        }
      },
      "required": [
        "net_price_minor",
        "currency",
        "availability",
        "stock",
        "shipping_terms",
        "return_terms"
      ],
      "additionalProperties": false
    },
    "Offer": {
      "type": "object",
      "properties": {
        "offer_version_id": {
          "type": "string",
          "format": "uuid"
        },
        "net_price_minor": {
          "anyOf": [
            {
              "type": "integer",
              "minimum": 1,
              "maximum": 100000000000
            },
            {
              "type": "string",
              "pattern": "^[1-9][0-9]*$"
            }
          ]
        },
        "currency": {
          "enum": [
            "TWD",
            "USD"
          ]
        },
        "revision": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "snapshot_sha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        }
      },
      "required": [
        "offer_version_id",
        "net_price_minor",
        "currency",
        "revision",
        "snapshot_sha256"
      ],
      "additionalProperties": true
    },
    "Product": {
      "type": "object",
      "properties": {
        "product_id": {
          "type": "string",
          "format": "uuid"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "supplier_ref": {
          "type": "string",
          "format": "uuid"
        },
        "current_offer": {
          "$ref": "#/components/schemas/Offer"
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "checkout_enabled": {
          "const": false
        }
      },
      "required": [
        "product_id",
        "title",
        "supplier_ref",
        "current_offer",
        "aggregate_version",
        "checkout_enabled"
      ],
      "additionalProperties": true
    },
    "StoreInput": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "description": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1500
        },
        "support_contact": {
          "type": "string",
          "minLength": 1,
          "maxLength": 250
        }
      },
      "required": [
        "name",
        "description",
        "support_contact"
      ],
      "additionalProperties": false
    },
    "Store": {
      "type": "object",
      "properties": {
        "store_id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "seller_ref": {
          "type": "string",
          "format": "uuid"
        },
        "checkout_enabled": {
          "const": false
        }
      },
      "required": [
        "store_id",
        "name",
        "seller_ref",
        "checkout_enabled"
      ],
      "additionalProperties": true
    },
    "ListingInput": {
      "type": "object",
      "properties": {
        "store_id": {
          "type": "string",
          "format": "uuid"
        },
        "offer_version_id": {
          "type": "string",
          "format": "uuid"
        },
        "retail_price_minor": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100000000000
        },
        "sale_terms": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1500
        }
      },
      "required": [
        "store_id",
        "offer_version_id",
        "retail_price_minor",
        "sale_terms"
      ],
      "additionalProperties": false
    },
    "Listing": {
      "type": "object",
      "properties": {
        "listing_id": {
          "type": "string",
          "format": "uuid"
        },
        "store_id": {
          "type": "string",
          "format": "uuid"
        },
        "snapshot_sha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "snapshot": {
          "type": "object"
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "state": {
          "enum": [
            "draft",
            "requested",
            "accepted",
            "declined"
          ]
        }
      },
      "required": [
        "listing_id",
        "store_id",
        "snapshot_sha256",
        "snapshot",
        "aggregate_version",
        "state"
      ],
      "additionalProperties": true
    },
    "SnapshotInput": {
      "type": "object",
      "properties": {
        "snapshot_sha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        }
      },
      "required": [
        "snapshot_sha256"
      ],
      "additionalProperties": false
    },
    "DecisionInput": {
      "type": "object",
      "properties": {
        "snapshot_sha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "decision": {
          "enum": [
            "accepted",
            "declined"
          ]
        },
        "note": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "acknowledge_internal_preview": {
          "const": true
        }
      },
      "required": [
        "snapshot_sha256",
        "decision",
        "note",
        "acknowledge_internal_preview"
      ],
      "additionalProperties": false
    },
    "Acceptance": {
      "type": "object",
      "properties": {
        "acceptance_id": {
          "type": "string",
          "format": "uuid"
        },
        "state": {
          "enum": [
            "requested",
            "accepted",
            "declined"
          ]
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "snapshot_sha256": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        }
      },
      "required": [
        "acceptance_id",
        "state",
        "aggregate_version",
        "snapshot_sha256"
      ],
      "additionalProperties": true
    },
    "ProjectInput": {
      "type": "object",
      "properties": {
        "repository_url": {
          "type": "string",
          "minLength": 1,
          "maxLength": 300
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "description": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "use_notes": {
          "type": "string",
          "minLength": 1,
          "maxLength": 3000
        },
        "demo_url": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "relationship": {
          "enum": [
            "author",
            "maintainer",
            "contributor",
            "curator"
          ]
        },
        "consent_to_share": {
          "const": true
        }
      },
      "required": [
        "repository_url",
        "title",
        "description",
        "use_notes",
        "relationship",
        "consent_to_share"
      ],
      "additionalProperties": false
    },
    "ProjectMetadata": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "description": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "use_notes": {
          "type": "string",
          "minLength": 1,
          "maxLength": 3000
        },
        "demo_url": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "required": [
        "title",
        "description",
        "use_notes"
      ],
      "additionalProperties": false
    },
    "Project": {
      "type": "object",
      "properties": {
        "project_id": {
          "type": "string",
          "format": "uuid"
        },
        "repository_id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 30
        },
        "repository_full_name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "owner_ref": {
          "type": "string",
          "format": "uuid"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "current_version": {
          "type": "object",
          "properties": {
            "commit_sha": {
              "type": "string",
              "pattern": "^[a-f0-9]{40}$"
            },
            "license_spdx": {
              "type": "string",
              "minLength": 1,
              "maxLength": 100
            }
          },
          "required": [
            "commit_sha",
            "license_spdx"
          ],
          "additionalProperties": true
        }
      },
      "required": [
        "project_id",
        "repository_id",
        "repository_full_name",
        "owner_ref",
        "title",
        "aggregate_version",
        "current_version"
      ],
      "additionalProperties": true
    },
    "CampaignInput": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "audience": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "goal": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "draft_text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 6000
        },
        "source_project_id": {
          "anyOf": [
            {
              "type": "string",
              "format": "uuid"
            },
            {
              "type": "null"
            }
          ]
        },
        "source_supplier_product_id": {
          "anyOf": [
            {
              "type": "string",
              "format": "uuid"
            },
            {
              "type": "null"
            }
          ]
        },
        "source_brief": {
          "type": "string",
          "minLength": 0,
          "maxLength": 3000
        }
      },
      "required": [
        "title",
        "audience",
        "goal",
        "draft_text"
      ],
      "additionalProperties": false
    },
    "CampaignMetadata": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "audience": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "goal": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000
        },
        "draft_text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 6000
        }
      },
      "required": [
        "title",
        "audience",
        "goal",
        "draft_text"
      ],
      "additionalProperties": false
    },
    "Campaign": {
      "type": "object",
      "properties": {
        "campaign_id": {
          "type": "string",
          "format": "uuid"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "source_snapshot": {
          "type": "object"
        },
        "draft_text": {
          "type": "string",
          "minLength": 1,
          "maxLength": 6000
        }
      },
      "required": [
        "campaign_id",
        "title",
        "aggregate_version",
        "source_snapshot",
        "draft_text"
      ],
      "additionalProperties": true
    },
    "ShareInput": {
      "type": "object",
      "properties": {
        "channel": {
          "type": "string",
          "minLength": 1,
          "maxLength": 80
        },
        "share_url": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "note": {
          "type": "string",
          "minLength": 0,
          "maxLength": 1000
        }
      },
      "required": [
        "channel",
        "share_url"
      ],
      "additionalProperties": false
    },
    "Share": {
      "type": "object",
      "properties": {
        "share_id": {
          "type": "string",
          "format": "uuid"
        },
        "verification_status": {
          "const": "self_reported"
        }
      },
      "required": [
        "share_id",
        "verification_status"
      ],
      "additionalProperties": true
    },
    "Work": {
      "type": "object",
      "properties": {
        "work_item_id": {
          "type": "string",
          "format": "uuid"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "aggregate_version": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        }
      },
      "required": [
        "work_item_id",
        "title",
        "aggregate_version"
      ],
      "additionalProperties": true
    },
    "Dashboard": {
      "type": "object"
    },
    "GuildList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Guild"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "ProductList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Product"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "StoreList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Store"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "ListingList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Listing"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "AcceptanceList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Acceptance"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "ProjectList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Project"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "CampaignList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Campaign"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "WorkList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Work"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "TrackList": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "type": "object"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    }
  },
  "auth": "member_session_csrf",
  "external_job_execution": false,
  "public_checkout": false
}
;
export const protocolSha256="24ea85e29ce221d4f12a07041729c9c88b90d000278d28b5eb0e0c4d822dd2df";
