import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const role = v.union(v.literal('OWNER'), v.literal('EDITOR'), v.literal('VIEWER'));
const kind = v.union(v.literal('PURCHASE'), v.literal('ENQUIRY'));
const mode = v.union(v.literal('PER_PACKAGE'), v.literal('PER_BASE_UNIT'), v.literal('LINE_TOTAL'));
const status = v.union(v.literal('ACTIVE'), v.literal('VOIDED'));

export default defineSchema({
  users: defineTable({}),
  workspaces: defineTable({ name: v.string(), createdAt: v.number() }),
  members: defineTable({ workspaceId: v.id('workspaces'), identity: v.string(), role, active: v.boolean() })
    .index('by_identity', ['identity']).index('by_workspace_and_identity', ['workspaceId', 'identity']),
  submissions: defineTable({ workspaceId: v.id('workspaces'), key: v.string() }).index('by_workspace_and_key', ['workspaceId', 'key']),
  migrationMappings: defineTable({ workspaceId: v.id('workspaces'), sourceDeployment: v.string(), sourceTable: v.string(), sourceId: v.string(), targetTable: v.string(), targetId: v.string(), batchId: v.string(), rawJson: v.optional(v.string()) }).index('by_workspace_and_source', ['workspaceId', 'sourceDeployment', 'sourceTable', 'sourceId']),
  legacyObservations: defineTable({ workspaceId: v.id('workspaces'), sourceDeployment: v.string(), sourceTable: v.string(), sourceId: v.string(), batchId: v.string(), kind, rawJson: v.string(), reason: v.string(), status: v.union(v.literal('UNRESOLVED'), v.literal('RESOLVED')) }).index('by_workspace_and_source', ['workspaceId', 'sourceDeployment', 'sourceTable', 'sourceId']),
  categories: defineTable({ workspaceId: v.id('workspaces'), name: v.string(), normalizedName: v.string(), active: v.boolean() })
    .index('by_workspace_and_name', ['workspaceId', 'normalizedName']),
  items: defineTable({ workspaceId: v.id('workspaces'), name: v.string(), normalizedName: v.string(), aliases: v.array(v.string()), sku: v.optional(v.string()), categoryId: v.optional(v.id('categories')), baseUnit: v.string(), packageType: v.string(), packageContent: v.string(), preferredDistributorId: v.optional(v.id('distributors')), active: v.boolean(), createdAt: v.number(), updatedAt: v.number() })
    .index('by_workspace_and_name', ['workspaceId', 'normalizedName']),
  distributors: defineTable({ workspaceId: v.id('workspaces'), name: v.string(), normalizedName: v.string(), phone: v.optional(v.string()), notes: v.optional(v.string()), active: v.boolean(), createdAt: v.number(), updatedAt: v.number() })
    .index('by_workspace_and_name', ['workspaceId', 'normalizedName']),
  itemDistributors: defineTable({ workspaceId: v.id('workspaces'), itemId: v.id('items'), distributorId: v.id('distributors') })
    .index('by_workspace_and_item_and_distributor', ['workspaceId', 'itemId', 'distributorId'])
    .index('by_workspace_and_distributor', ['workspaceId', 'distributorId']),
  bills: defineTable({ workspaceId: v.id('workspaces'), distributorId: v.id('distributors'), billDate: v.string(), billNumber: v.string(), notes: v.string(), status: v.union(v.literal('DRAFT'), v.literal('ACTIVE'), v.literal('DELETED')), totalPaise: v.number(), version: v.number(), createdAt: v.number(), updatedAt: v.number(), createdBy: v.string(), deletedAt: v.optional(v.number()) })
    .index('by_workspace_and_status_and_date', ['workspaceId', 'status', 'billDate']),
  billLines: defineTable({ workspaceId: v.id('workspaces'), billId: v.id('bills'), itemId: v.id('items'), lineKey: v.string(), packageType: v.string(), packageContent: v.string(), packageCount: v.string(), mode, price: v.string(), discount: v.string(), quantity: v.string(), netPaise: v.number(), unitRate: v.string(), status })
    .index('by_workspace_and_bill', ['workspaceId', 'billId']),
  priceRecords: defineTable({ workspaceId: v.id('workspaces'), kind, itemId: v.id('items'), distributorId: v.id('distributors'), itemName: v.string(), distributorName: v.string(), eventDate: v.string(), baseUnit: v.string(), packageType: v.string(), packageContent: v.string(), packageCount: v.string(), mode, price: v.string(), quantity: v.string(), netPaise: v.number(), unitRate: v.string(), legacySource: v.optional(v.object({ deployment: v.string(), table: v.string(), id: v.string(), rawJson: v.string(), billNumber: v.optional(v.string()), billId: v.optional(v.string()), batchId: v.string(), normalization: v.string() })), sourceBillId: v.optional(v.id('bills')), sourceLineId: v.optional(v.id('billLines')), sourceStatus: v.union(v.literal('NONE'), v.literal('ACTIVE'), v.literal('DELETED'), v.literal('LEGACY')), status, version: v.number(), createdAt: v.number(), updatedAt: v.number(), createdBy: v.string() })
    .index('by_workspace_and_status_and_date', ['workspaceId', 'status', 'eventDate'])
    .index('by_workspace_and_item_and_kind_and_status_and_date', ['workspaceId', 'itemId', 'kind', 'status', 'eventDate'])
    .index('by_workspace_and_bill', ['workspaceId', 'sourceBillId'])
    .index('by_workspace_and_line', ['workspaceId', 'sourceLineId']),
  revisions: defineTable({ workspaceId: v.id('workspaces'), priceRecordId: v.id('priceRecords'), action: v.string(), before: v.optional(v.string()), after: v.optional(v.string()), actor: v.string(), at: v.number() })
    .index('by_workspace_and_record_and_at', ['workspaceId', 'priceRecordId', 'at']),
  audit: defineTable({ workspaceId: v.id('workspaces'), actor: v.string(), action: v.string(), entity: v.string(), at: v.number() })
    .index('by_workspace_and_at', ['workspaceId', 'at']),
  attachments: defineTable({ workspaceId: v.id('workspaces'), billId: v.id('bills'), storageId: v.id('_storage'), name: v.string(), mime: v.string(), size: v.number() })
    .index('by_workspace_and_bill', ['workspaceId', 'billId']),
});
