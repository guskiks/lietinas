import SwiftUI
import SwiftData

@main
struct LietinasApp: App {
    @Environment(\.scenePhase) private var scenePhase
    private let container: ModelContainer

    init() {
        do { container = try ModelContainer(for: TaskItem.self, Note.self, Habit.self, HabitEntry.self, Goal.self, CalendarEvent.self) }
        catch { fatalError("Neizdevās sagatavot datu krātuvi: \(error)") }
    }

    var body: some Scene {
        WindowGroup { RootView().task { await AppServices.shared.applicationStarted(container: container) } }
            .modelContainer(container)
            .onChange(of: scenePhase) { _, phase in
                if phase == .active { Task { await AppServices.shared.applicationBecameActive(container: container) } }
            }
    }
}

@MainActor
final class AppServices {
    static let shared = AppServices()
    let notifications = NotificationService()
    let backups = BackupService()
    private init() {}
    func applicationStarted(container: ModelContainer) async { await notifications.requestIfNeeded(); await backups.checkDailyBackup(container: container); await notifications.refresh(container: container) }
    func applicationBecameActive(container: ModelContainer) async { await backups.checkDailyBackup(container: container); await notifications.refresh(container: container) }
}
