import XCTest
@testable import Lietinas

final class LietinasTests: XCTestCase {
    func testTaskDefaults() { let task = TaskItem(title: "Pārbaudīt plānu"); XCTAssertFalse(task.isCompleted); XCTAssertEqual(task.priority, .medium); XCTAssertTrue(Calendar.current.isDateInToday(task.dueDate)) }
    func testHabitEntryUsesDay() { let habit = Habit(title: "Ūdens"); let entry = HabitEntry(habitID: habit.id); XCTAssertEqual(entry.habitID, habit.id); XCTAssertTrue(Calendar.current.isDateInToday(entry.date)) }
    func testBackupJSONRoundTrip() throws { let envelope = BackupService.Envelope(createdAt: .now, tasks: [], notes: [], habits: [], entries: [], goals: [], events: []); let data = try JSONEncoder.backup.encode(envelope); XCTAssertNoThrow(try JSONDecoder.backup.decode(BackupService.Envelope.self, from: data)) }
}
