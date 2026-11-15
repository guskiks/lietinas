import SwiftUI
import SwiftData
import BackgroundTasks

@main
struct LietinasApp: App {
    @Environment(\.scenePhase) private var scenePhase
    private let container: ModelContainer

    init() {
        do { container = try ModelContainer(for: TaskItem.self, Note.self, Habit.self, HabitEntry.self, Goal.self, CalendarEvent.self) }
        catch { fatalError("Neizdevās sagatavot datu krātuvi: \(error)") }
        BackgroundTaskService.register()
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
    private(set) var container: ModelContainer?
    func applicationStarted(container: ModelContainer) async { self.container = container; await notifications.requestIfNeeded(); await backups.checkDailyBackup(container: container); await notifications.refresh(container: container); BackgroundTaskService.schedule() }
    func applicationBecameActive(container: ModelContainer) async { self.container = container; await backups.checkDailyBackup(container: container); await notifications.refresh(container: container); BackgroundTaskService.schedule() }
}

@MainActor enum BackgroundTaskService {
    static let identifier = "lv.lietinas.app.backup"
    static func register() { BGTaskScheduler.shared.register(forTaskWithIdentifier: identifier, using: nil) { task in
        task.expirationHandler = { task.setTaskCompleted(success: false) }
        Task { @MainActor in
            guard let container = AppServices.shared.container else { task.setTaskCompleted(success: false); return }
            _ = try? AppServices.shared.backups.create(container: container)
            task.setTaskCompleted(success: true)
            schedule()
        }
    } }
    static func schedule() { let request = BGProcessingTaskRequest(identifier: identifier); request.earliestBeginDate = Calendar.current.date(byAdding: .hour, value: 6, to: .now); request.requiresNetworkConnectivity = false; request.requiresExternalPower = false; try? BGTaskScheduler.shared.submit(request) }
}
