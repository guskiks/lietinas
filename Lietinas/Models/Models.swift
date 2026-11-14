import Foundation
import SwiftData

enum TaskPriority: String, Codable, CaseIterable, Identifiable { case low = "Zema", medium = "Vidēja", high = "Augsta"; var id: String { rawValue }; var icon: String { self == .high ? "flame.fill" : self == .medium ? "exclamationmark.circle.fill" : "circle.fill" } }
enum HabitFrequency: String, Codable, CaseIterable, Identifiable { case daily = "Katru dienu", weekly = "Katru nedēļu"; var id: String { rawValue } }

@Model final class TaskItem { @Attribute(.unique) var id: UUID; var title: String; var details: String; var dueDate: Date; var dueTime: Date?; var isCompleted: Bool; var priorityRaw: String; var category: String; var reminderDate: Date?; var repeatRule: String; var createdAt: Date; var completedAt: Date?
    init(title: String, dueDate: Date = .now, details: String = "", priority: TaskPriority = .medium, category: String = "Personīgais", dueTime: Date? = nil, reminderDate: Date? = nil, repeatRule: String = "") { id = UUID(); self.title = title; self.details = details; self.dueDate = Calendar.current.startOfDay(for: dueDate); self.dueTime = dueTime; isCompleted = false; priorityRaw = priority.rawValue; self.category = category; self.reminderDate = reminderDate; self.repeatRule = repeatRule; createdAt = .now }
    var priority: TaskPriority { get { TaskPriority(rawValue: priorityRaw) ?? .medium } set { priorityRaw = newValue.rawValue } }
}
@Model final class Note { @Attribute(.unique) var id: UUID; var title: String; var content: String; var category: String; var color: String; var createdAt: Date; var updatedAt: Date; var isPinned: Bool; var isShoppingList: Bool
    init(title: String = "", content: String = "", category: String = "Personīgais", color: String = "pink", isShoppingList: Bool = false) { id = UUID(); self.title = title; self.content = content; self.category = category; self.color = color; createdAt = .now; updatedAt = .now; isPinned = false; self.isShoppingList = isShoppingList }
}
@Model final class Habit { @Attribute(.unique) var id: UUID; var title: String; var frequencyRaw: String; var createdAt: Date; var isActive: Bool
    init(title: String, frequency: HabitFrequency = .daily) { id = UUID(); self.title = title; frequencyRaw = frequency.rawValue; createdAt = .now; isActive = true }
    var frequency: HabitFrequency { get { HabitFrequency(rawValue: frequencyRaw) ?? .daily } set { frequencyRaw = newValue.rawValue } }
}
@Model final class HabitEntry { @Attribute(.unique) var id: UUID; var habitID: UUID; var date: Date; var isCompleted: Bool; init(habitID: UUID, date: Date = .now, isCompleted: Bool = true) { id = UUID(); self.habitID = habitID; self.date = Calendar.current.startOfDay(for: date); self.isCompleted = isCompleted } }
@Model final class Goal { @Attribute(.unique) var id: UUID; var title: String; var goalDescription: String; var targetDate: Date?; var progress: Double; var category: String; init(title: String, description: String = "", targetDate: Date? = nil, category: String = "Personīgais") { id = UUID(); self.title = title; goalDescription = description; self.targetDate = targetDate; progress = 0; self.category = category } }
@Model final class CalendarEvent { @Attribute(.unique) var id: UUID; var title: String; var startDate: Date; var endDate: Date; var location: String; var reminderDate: Date?; var repeatRule: String; init(title: String, startDate: Date = .now, endDate: Date? = nil, location: String = "", reminderDate: Date? = nil) { id = UUID(); self.title = title; self.startDate = startDate; self.endDate = endDate ?? startDate.addingTimeInterval(3600); self.location = location; self.reminderDate = reminderDate; repeatRule = "" } }
