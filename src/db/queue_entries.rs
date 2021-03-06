use crate::db;
use crate::models::queue_entry::{QueueEntry, SendableQueueEntry};
use crate::schema::{queue_entries, queues, users};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result::{DatabaseErrorKind, Error};
use std::collections::HashMap;
use unicode_truncate::UnicodeTruncateStr;

pub enum QueueEntryCreationError {
    DuplicatedName,
}

impl From<Error> for QueueEntryCreationError {
    fn from(err: Error) -> QueueEntryCreationError {
        if let Error::DatabaseError(DatabaseErrorKind::UniqueViolation, info) = &err {
            match info.constraint_name() {
                Some("users_username_key") => return QueueEntryCreationError::DuplicatedName,
                _ => {}
            }
        }
        panic!("Error creating user: {:?}", err)
    }
}

pub fn all(conn: &PgConnection) -> HashMap<String, Vec<SendableQueueEntry>> {
    let all_data = queue_entries::table
        .inner_join(users::table)
        .inner_join(queues::table)
        .select((
            queues::name,
            (
                users::username,
                users::ugkthid,
                users::realname,
                queue_entries::location,
                queue_entries::usercomment,
                queue_entries::starttime,
                queue_entries::gettinghelp,
                queue_entries::help,
                queue_entries::badlocation,
            ),
        ))
        .order(queue_entries::id.asc())
        .load::<(String, SendableQueueEntry)>(conn)
        .expect("Could not get queues");
    let mut m = HashMap::new();
    for (k, v) in all_data {
        m.entry(k).or_insert_with(Vec::new).push(v)
    }
    m
}

pub fn update_help_status(
    conn: &PgConnection,
    queue_id: i32,
    user_id: i32,
    status: bool,
) -> Result<QueueEntry, diesel::result::Error> {
    let entry = find(conn, queue_id, user_id)?;
    diesel::update(&entry)
        .set(queue_entries::gettinghelp.eq(status))
        .get_result(conn)
}

pub fn update_bad_location(
    conn: &PgConnection,
    queue_id: i32,
    user_id: i32,
    badlocation: bool,
) -> Result<QueueEntry, diesel::result::Error> {
    let entry = find(conn, queue_id, user_id)?;
    diesel::update(&entry)
        .set((queue_entries::badlocation.eq(badlocation),))
        .get_result(conn)
}

pub fn update_user_data(
    conn: &PgConnection,
    queue_id: i32,
    user_id: i32,
    location: &str,
    usercomment: &str,
    help: bool,
) -> Result<QueueEntry, diesel::result::Error> {
    let entry = find(conn, queue_id, user_id)?;
    let (location, _) = location.unicode_truncate(50);
    let (usercomment, _) = usercomment.unicode_truncate(140);
    diesel::update(&entry)
        .set((
            queue_entries::location.eq(location),
            queue_entries::usercomment.eq(usercomment),
            queue_entries::help.eq(help),
            queue_entries::badlocation.eq(false),
        ))
        .get_result(conn)
}

pub fn find(
    conn: &PgConnection,
    queue_id: i32,
    user_id: i32,
) -> Result<QueueEntry, diesel::result::Error> {
    queue_entries::table
        .filter(
            queue_entries::queue_id
                .eq(queue_id)
                .and(queue_entries::user_id.eq(user_id)),
        )
        .first(conn)
}

pub fn find_by_ugkthid(
    conn: &PgConnection,
    queue_id: i32,
    ugkthid: &str,
) -> Result<QueueEntry, diesel::result::Error> {
    queue_entries::table
        .filter(
            queue_entries::queue_id.eq(queue_id).and(
                queue_entries::user_id.nullable().eq(users::table
                    .select(users::id)
                    .filter(users::ugkthid.eq(ugkthid))
                    .single_value()),
            ),
        )
        .first(conn)
}

pub fn for_queue(conn: &PgConnection, queue_name: &str) -> Option<Vec<SendableQueueEntry>> {
    let queue = db::queues::find_by_name(conn, queue_name).ok()?;
    queue_entries::table
        .inner_join(users::table)
        .filter(queue_entries::queue_id.eq(queue.id))
        .select((
            users::username,
            users::ugkthid,
            users::realname,
            queue_entries::location,
            queue_entries::usercomment,
            queue_entries::starttime,
            queue_entries::gettinghelp,
            queue_entries::help,
            queue_entries::badlocation,
        ))
        .order(queue_entries::id.asc())
        .get_results::<SendableQueueEntry>(conn)
        .ok()
}

pub fn remove_all(conn: &PgConnection) -> Result<(), diesel::result::Error> {
    println!("Deleting all entiries");
    diesel::delete(queue_entries::table)
        .execute(conn)
        .map(|_| ())
}

pub fn remove_multiple(
    conn: &PgConnection,
    entries: &Vec<QueueEntry>,
) -> Result<(), diesel::result::Error> {
    diesel::delete(queue_entries::table.filter(
        queue_entries::id.eq_any::<Vec<i32>>(entries.into_iter().map(|entry| entry.id).collect()),
    ))
    .execute(conn)
    .map(|_| ())
}

pub fn create(
    conn: &PgConnection,
    user_id: i32,
    queue_id: i32,
    location: &str,
    usercomment: &str,
    help: bool,
) -> Result<QueueEntry, diesel::result::Error> {
    let (location, _) = location.unicode_truncate(50);
    let (usercomment, _) = usercomment.unicode_truncate(140);
    let new_queue = &NewQueueEntry {
        user_id,
        queue_id,
        location,
        usercomment,
        help,
    };

    diesel::insert_into(queue_entries::table)
        .values(new_queue)
        .get_result::<QueueEntry>(conn)
        .map_err(Into::into)
}

#[derive(Insertable)]
#[table_name = "queue_entries"]
pub struct NewQueueEntry<'a> {
    user_id: i32,
    queue_id: i32,
    location: &'a str,
    usercomment: &'a str,
    help: bool,
}
