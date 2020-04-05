use crate::db::queues;
use crate::models::queue_entry::{QueueEntry, SendableQueueEntry};
use crate::schema::queue_entries;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result::{DatabaseErrorKind, Error};

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

pub fn for_queue(conn: &PgConnection, queue_name: &str) -> Option<Vec<SendableQueueEntry>> {
    let queue = queues::find_by_name(conn, queue_name).ok()?;
    QueueEntry::belonging_to(&queue)
        .load(conn)
        .map(|entries: Vec<QueueEntry>| {
            entries
                .into_iter()
                .map(|entry| entry.to_sendable(conn))
                .collect()
        })
        .ok()
}

pub fn remove(
    conn: &PgConnection,
    queue_id: i32,
    user_id: i32,
) -> Result<(), diesel::result::Error> {
    diesel::delete(
        queue_entries::table.filter(
            queue_entries::queue_id
                .eq(queue_id)
                .and(queue_entries::user_id.eq(user_id)),
        ),
    )
    .execute(conn)
    .map(|_| ())
}

pub fn create(
    conn: &PgConnection,
    user_id: i32,
    queue_id: i32,
    location: &str,
    usercomment: &str,
) -> Result<QueueEntry, diesel::result::Error> {
    let new_queue = &NewQueueEntry {
        user_id,
        queue_id,
        location,
        usercomment,
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
}
