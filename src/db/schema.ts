import {pgTable, text, timestamp, uuid, jsonb, index} from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";

export const profiles = pgTable("bus_terminal_profiles", {
    userId: uuid("user_id").primaryKey(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
});

export const snapshots = pgTable(
    "bus_terminal_snapshots",
    {
        id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
        userId: uuid("user_id").notNull(),
        label: text("label").notNull().default("내 개발환경"),
        data: jsonb("data").notNull(),
        createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
    },
    table => ({
        userUpdatedIdx: index("bus_terminal_snapshots_user_updated_idx").on(table.userId, table.updatedAt)
    })
);
