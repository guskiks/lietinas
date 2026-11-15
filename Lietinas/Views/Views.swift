import SwiftUI
import SwiftData
import UIKit
import UniformTypeIdentifiers
import PhotosUI
import Charts

struct RootView: View {
    var body: some View { TabView { TodayView().tabItem { Label("Å odien", systemImage: "sun.max.fill") }; CalendarView().tabItem { Label("KalendÄrs", systemImage: "calendar") }; NotesView().tabItem { Label("PiezÄ«mes", systemImage: "note.text") }; HabitsView().tabItem { Label("Paradumi", systemImage: "leaf.fill") }; ProfileView().tabItem { Label("Profils", systemImage: "person.crop.circle") } }.tint(AppColors.primary).background(AppColors.background) }
}

struct TodayView: View {
    @Environment(\.modelContext) private var context; @Query private var tasks: [TaskItem]; @Query private var habits: [Habit]; @Query private var events: [CalendarEvent]; @State private var adding = false; @State private var editingTask: TaskItem?
    private var today: [TaskItem] { tasks.filter { Calendar.current.isDateInToday($0.dueDate) }.sorted { $0.isCompleted == false && $1.isCompleted == true } }; private var done: Int { today.filter(\.isCompleted).count }; private var dailyMessage: String { let messages = ["Mazs solis Åodien ir liels solis uz priekÅu.", "Tu vari vairÄk, nekÄ Åodien ÅÄ·iet.", "Atceries arÄ« par sevi un savu mieru.", "Å odiena ir skaista vieta, no kuras sÄkt.", "Tavas mazÄs lietiÅ†as veido lielu dienu.", "LÄ“ni un mierÄ«gi ā€” tu visu paspÄ“si.", "Å odien izvÄ“lies vienu lietu, kas iepriecinÄs tevi."]; return messages[Calendar.current.ordinality(of: .day, in: .year, for: .now)! % messages.count] }
    var body: some View { NavigationStack { ScrollView { VStack(alignment: .leading, spacing: 18) { Text("Sveika, Vika! ā™").font(.largeTitle.bold()); Text(Date.now.latvianLong.capitalized).foregroundStyle(AppColors.secondary); Text(dailyMessage).italic().foregroundStyle(AppColors.primary)
            AppCard { VStack(alignment: .leading, spacing: 10) { HStack { Text("Å odienas progress").font(.headline); Spacer(); Text("\(done)/\(today.count)").foregroundStyle(AppColors.primary) }; ProgressView(value: today.isEmpty ? 0 : Double(done)/Double(today.count)).tint(AppColors.primary) } }
            section("Steidzamie", tasks: today.filter { !$0.isCompleted && $0.priority == .high }); section("Å odien", tasks: today.filter { !$0.isCompleted && $0.priority != .high }); section("Pabeigtie", tasks: today.filter(\.isCompleted))
            if !habits.isEmpty { Text("Å odienas paradumi").font(.title3.bold()); AppCard { ForEach(habits.filter(\.isActive)) { habit in HabitRow(habit: habit) } } }
            if let event = events.filter({ $0.startDate >= .now }).sorted(by: { $0.startDate < $1.startDate }).first { Text("NÄkamais notikums").font(.title3.bold()); AppCard { Label(event.title, systemImage: "calendar.badge.clock"); Text(event.startDate.formatted(date: .abbreviated, time: .shortened)).foregroundStyle(AppColors.secondary) } }
        }.padding() }.background(AppColors.background).navigationTitle("LietiÅ†as").toolbar { Button { adding = true } label: { Image(systemName: "plus.circle.fill").font(.title2) } }.sheet(isPresented: $adding) { TaskEditor(task: nil) }.sheet(item: $editingTask) { task in TaskEditor(task: task) } } }
    @ViewBuilder private func section(_ title: String, tasks: [TaskItem]) -> some View { if !tasks.isEmpty { Text(title).font(.title3.bold()); AppCard { ForEach(tasks) { task in TaskRow(task: task) { editingTask = task } } } } }
}
struct TaskRow: View { @Environment(\.modelContext) private var context; let task: TaskItem; var onEdit: () -> Void = {}; var body: some View { HStack { Button { task.isCompleted.toggle(); task.completedAt = task.isCompleted ? .now : nil; try? context.save(); Task { await AppServices.shared.notifications.refresh(container: context.container) } } label: { Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle").font(.title2).foregroundStyle(task.isCompleted ? AppColors.primary : AppColors.accent) }; VStack(alignment: .leading) { Text(task.title).strikethrough(task.isCompleted); Text(task.category).font(.caption).foregroundStyle(AppColors.secondary) }; Spacer(); if task.imageData != nil { Image(systemName: "photo").foregroundStyle(AppColors.accent) }; Image(systemName: task.priority.icon).foregroundStyle(task.priority == .high ? .red : AppColors.accent) }.padding(.vertical, 4).contentShape(Rectangle()).onTapGesture(perform: onEdit).swipeActions(edge: .trailing, allowsFullSwipe: true) { Button(role: .destructive) { context.delete(task); try? context.save() } label: { Label("DzÄ“st", systemImage: "trash") } }.contextMenu { Button("RediÄ£Ä“t") { onEdit() }; Button("DzÄ“st", role: .destructive) { context.delete(task); try? context.save() } } }
}
struct TaskEditor: View { @Environment(\.dismiss) private var dismiss; @Environment(\.modelContext) private var context; let task: TaskItem?; @State private var title: String; @State private var details: String; @State private var date: Date; @State private var priority: TaskPriority; @State private var category: String; @State private var reminder: Bool; @State private var reminderDate: Date; @State private var photoItem: PhotosPickerItem?; @State private var imageData: Data?
    init(task: TaskItem?) { self.task = task; _title = State(initialValue: task?.title ?? ""); _details = State(initialValue: task?.details ?? ""); _date = State(initialValue: task?.dueDate ?? .now); _priority = State(initialValue: task?.priority ?? .medium); _category = State(initialValue: task?.category ?? "PersonÄ«gais"); _reminder = State(initialValue: task?.reminderDate != nil); _reminderDate = State(initialValue: task?.reminderDate ?? Date().addingTimeInterval(3600)); _imageData = State(initialValue: task?.imageData) }
    var body: some View { NavigationStack { Form { Section("LietiÅ†a") { TextField("Nosaukums", text: $title); TextField("Apraksts", text: $details, axis: .vertical); DatePicker("Datums", selection: $date, displayedComponents: .date); Picker("PrioritÄte", selection: $priority) { ForEach(TaskPriority.allCases) { Text($0.rawValue).tag($0) } }; TextField("Kategorija", text: $category); PhotosPicker(selection: $photoItem, matching: .images) { Label(imageData == nil ? "Pievienot attÄ“lu" : "MainÄ«t attÄ“lu", systemImage: "photo") }; if let imageData, let image = UIImage(data: imageData) { Image(uiImage: image).resizable().scaledToFit().frame(maxHeight: 160).clipShape(RoundedRectangle(cornerRadius: 12)) } }; Section("AtgÄdinÄjums") { Toggle("IestatÄ«t atgÄdinÄjumu", isOn: $reminder); if reminder { DatePicker("Laiks", selection: $reminderDate, in: Date()..., displayedComponents: [.date, .hourAndMinute]) } } }.navigationTitle(task == nil ? "Jauna lietiÅ†a" : "RediÄ£Ä“t lietiÅ†u").onChange(of: photoItem) { _, item in Task { if let data = try? await item?.loadTransferable(type: Data.self) { imageData = data } } }.toolbar { ToolbarItem(placement: .cancellationAction) { Button("Atcelt") { dismiss() } }; ToolbarItem(placement: .confirmationAction) { Button("SaglabÄt") { let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines); guard !cleanTitle.isEmpty else { return }; let value = task ?? TaskItem(title: cleanTitle); if task == nil { context.insert(value) }; value.title = cleanTitle; value.details = details; value.dueDate = Calendar.current.startOfDay(for: date); value.priority = priority; value.category = category; value.reminderDate = reminder ? reminderDate : nil; value.imageData = imageData; try? context.save(); dismiss() } } } } }
}

struct CalendarView: View { @Environment(\.modelContext) private var context; @Query private var tasks: [TaskItem]; @Query private var events: [CalendarEvent]; @State private var date = Date(); @State private var adding = false; @State private var editing: CalendarEvent?; var body: some View { NavigationStack { List { DatePicker("IzvÄ“lies dienu", selection: $date, displayedComponents: .date).datePickerStyle(.graphical); let dayTasks = tasks.filter { Calendar.current.isDate($0.dueDate, inSameDayAs: date) }; let dayEvents = events.filter { Calendar.current.isDate($0.startDate, inSameDayAs: date) }; Section("LietiÅ†as") { ForEach(dayTasks) { Text($0.title).strikethrough($0.isCompleted) }; if dayTasks.isEmpty { Text("Å ajÄ dienÄ nav lietiÅ†u.").foregroundStyle(AppColors.secondary) } }; Section("Notikumi") { ForEach(dayEvents) { event in Button { editing = event } label: { VStack(alignment: .leading) { Text(event.title); Text(event.startDate.formatted(date: .omitted, time: .shortened)).font(.caption).foregroundStyle(AppColors.secondary) } }.swipeActions { Button(role: .destructive) { context.delete(event); try? context.save() } label: { Label("DzÄ“st", systemImage: "trash") } } } } }.scrollContentBackground(.hidden).background(AppColors.background).navigationTitle("KalendÄrs").toolbar { Button { adding = true } label: { Image(systemName: "plus") } }.sheet(isPresented: $adding) { NavigationStack { EventEditor(event: nil, date: date) } }.sheet(item: $editing) { event in NavigationStack { EventEditor(event: event, date: event.startDate) } } } } }
struct EventEditor: View { @Environment(\.dismiss) private var dismiss; @Environment(\.modelContext) private var context; let event: CalendarEvent?; let date: Date; @State private var title: String; @State private var start: Date; @State private var end: Date; @State private var location: String; @State private var reminderEnabled: Bool; @State private var reminderDate: Date
    init(event: CalendarEvent?, date: Date) { self.event = event; self.date = date; _title = State(initialValue: event?.title ?? ""); _start = State(initialValue: event?.startDate ?? date); _end = State(initialValue: event?.endDate ?? date.addingTimeInterval(3600)); _location = State(initialValue: event?.location ?? ""); _reminderEnabled = State(initialValue: event?.reminderDate != nil); _reminderDate = State(initialValue: event?.reminderDate ?? date.addingTimeInterval(-900)) }
    var body: some View { Form { TextField("Notikuma nosaukums", text: $title); DatePicker("SÄkums", selection: $start); DatePicker("Beigas", selection: $end); TextField("Vieta", text: $location); Toggle("AtgÄdinÄjums", isOn: $reminderEnabled); if reminderEnabled { DatePicker("AtgÄdinÄjuma laiks", selection: $reminderDate, in: Date()...) } }.navigationTitle(event == nil ? "Jauns notikums" : "RediÄ£Ä“t notikumu").toolbar { ToolbarItem(placement: .cancellationAction) { Button("Atcelt") { dismiss() } }; ToolbarItem(placement: .confirmationAction) { Button("SaglabÄt") { let clean = title.trimmingCharacters(in: .whitespacesAndNewlines); guard !clean.isEmpty else { return }; let value = event ?? CalendarEvent(title: clean, startDate: start, endDate: end); if event == nil { context.insert(value) }; value.title = clean; value.startDate = start; value.endDate = end; value.location = location; value.reminderDate = reminderEnabled ? reminderDate : nil; try? context.save(); dismiss() } } } }
}

struct NotesView: View { @Environment(\.modelContext) private var context; @Query(sort: \Note.updatedAt, order: .reverse) private var notes: [Note]; @State private var search = ""; @State private var adding = false; var filtered: [Note] { notes.filter { search.isEmpty || $0.title.localizedCaseInsensitiveContains(search) || $0.content.localizedCaseInsensitiveContains(search) } }; var body: some View { NavigationStack { List { ForEach(filtered) { note in NavigationLink { NoteEditor(note: note) } label: { VStack(alignment: .leading) { HStack { Text(note.title.isEmpty ? "Bez nosaukuma" : note.title).font(.headline); if note.isPinned { Image(systemName: "pin.fill").foregroundStyle(AppColors.primary) } }; Text(note.content).lineLimit(2).foregroundStyle(AppColors.secondary) } }.swipeActions { Button(role: .destructive) { context.delete(note); try? context.save() } label: { Label("DzÄ“st", systemImage: "trash") } } } }.searchable(text: $search, prompt: "MeklÄ“t piezÄ«mÄ“s").scrollContentBackground(.hidden).background(AppColors.background).navigationTitle("PiezÄ«mes").toolbar { Button { adding = true } label: { Image(systemName: "plus") } }.sheet(isPresented: $adding) { NavigationStack { NoteEditor(note: nil) } } } } }
struct NoteEditor: View { @Environment(\.dismiss) private var dismiss; @Environment(\.modelContext) private var context; let note: Note?; @State private var title: String; @State private var content: String; @State private var category: String; @State private var color: String; @State private var pinned: Bool; @State private var photoItem: PhotosPickerItem?; @State private var imageData: Data?; let categories = ["PersonÄ«gais", "MÄcÄ«bas", "Darbs", "Iepirkumi", "Idejas"]; init(note: Note?) { self.note = note; _title = State(initialValue: note?.title ?? ""); _content = State(initialValue: note?.content ?? ""); _category = State(initialValue: note?.category ?? "PersonÄ«gais"); _color = State(initialValue: note?.color ?? "pink"); _pinned = State(initialValue: note?.isPinned ?? false); _imageData = State(initialValue: note?.imageData) }; var body: some View { Form { TextField("Virsraksts", text: $title); Picker("Kategorija", selection: $category) { ForEach(categories, id: \.self) { Text($0) } }; Picker("KrÄsa", selection: $color) { Text("RozÄ").tag("pink"); Text("Persiku").tag("peach"); Text("Lavanda").tag("lavender"); Text("Debesu").tag("blue") }; TextEditor(text: $content).frame(minHeight: 240); PhotosPicker(selection: $photoItem, matching: .images) { Label(imageData == nil ? "Pievienot attÄ“lu" : "MainÄ«t attÄ“lu", systemImage: "photo") }; if let imageData, let image = UIImage(data: imageData) { Image(uiImage: image).resizable().scaledToFit().frame(maxHeight: 180).clipShape(RoundedRectangle(cornerRadius: 12)) }; Toggle("Piespraust", isOn: $pinned) }.navigationTitle("PiezÄ«me").onChange(of: photoItem) { _, item in Task { if let data = try? await item?.loadTransferable(type: Data.self) { imageData = data } } }.toolbar { Button("SaglabÄt") { let n = note ?? Note(); if note == nil { context.insert(n) }; n.title = title; n.content = content; n.category = category; n.color = color; n.isPinned = pinned; n.imageData = imageData; n.updatedAt = .now; try? context.save(); dismiss() } } } }

struct HabitsView: View { @Query private var habits: [Habit]; @Query private var entries: [HabitEntry]; @State private var adding = false; @State private var editingHabit: Habit?; var body: some View { NavigationStack { ZStack { AppColors.background.ignoresSafeArea(); ScrollView { VStack(alignment: .leading, spacing: 16) { Text("Tavi paradumi").font(.largeTitle.bold()); Text("Mazi ieradumi veido lielas pÄrmaiÅ†as.").foregroundStyle(AppColors.secondary); ForEach(habits.filter(\.isActive)) { habit in HabitRow(habit: habit, entries: entries.filter { $0.habitID == habit.id }) { editingHabit = habit } } }.padding(.horizontal, 16).padding(.vertical, 8) } }.navigationTitle("Paradumi").toolbar { Button { adding = true } label: { Image(systemName: "plus.circle.fill").font(.title2) } }.sheet(isPresented: $adding) { HabitEditor(habit: nil) }.sheet(item: $editingHabit) { habit in HabitEditor(habit: habit) } } } }
struct HabitRow: View {
    @Environment(\.modelContext) private var context
    let habit: Habit
    var entries: [HabitEntry] = []
    var onEdit: () -> Void = {}

    private var todayEntry: HabitEntry? { entries.first { Calendar.current.isDateInToday($0.date) } }
    private var complete: Bool { todayEntry?.isCompleted == true }
    private var goalProgress: Double { min(1, Double(entries.filter(\.isCompleted).count) / Double(max(1, habit.targetDays))) }

    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(habit.title).font(.headline)
                            if habit.isGoal {
                                Text("MÄ’RÄ¶IS").font(.caption2.bold()).padding(.horizontal, 7).padding(.vertical, 3).background(AppColors.pink).clipShape(Capsule())
                            }
                        }
                        Text("\(habit.category) ā€¢ \(habit.frequency.rawValue)").font(.caption).foregroundStyle(AppColors.secondary)
                    }
                    Spacer()
                    Button {
                        if let entry = todayEntry {
                            entry.isCompleted.toggle()
                        } else {
                            context.insert(HabitEntry(habitID: habit.id, isCompleted: true))
                        }
                        try? context.save()
                    } label: {
                        Image(systemName: complete ? "checkmark.circle.fill" : "circle").font(.title).foregroundStyle(AppColors.primary)
                    }
                }
                if habit.isGoal {
                    HStack {
                        ProgressView(value: goalProgress).tint(AppColors.primary)
                        Text("\(entries.filter(\.isCompleted).count)/\(habit.targetDays)").font(.caption).foregroundStyle(AppColors.secondary)
                    }
                } else {
                    Text("Å odien: \(complete ? "paveikts" : "vÄ“l jÄizdara") ā€¢ SÄ“rija: \(streak)").font(.caption).foregroundStyle(AppColors.secondary)
                }
            }
        }.contentShape(Rectangle()).onTapGesture(perform: onEdit).contextMenu { Button("RediÄ£Ä“t", systemImage: "pencil") { onEdit() }; Button("DzÄ“st", role: .destructive) { context.delete(habit); entries.forEach { context.delete($0) }; try? context.save() } }
    }

    private var streak: Int {
        var count = 0
        var day = Date()
        while entries.contains(where: { Calendar.current.isDate($0.date, inSameDayAs: day) && $0.isCompleted }) {
            count += 1
            day = Calendar.current.date(byAdding: .day, value: -1, to: day)!
        }
        return count
    }
}
struct HabitEditor: View { @Environment(\.dismiss) private var dismiss; @Environment(\.modelContext) private var context; let habit: Habit?; @State private var title: String; @State private var frequency: HabitFrequency; @State private var category: String; @State private var isGoal: Bool; @State private var targetDays: Int; let categories = ["LabsajÅ«ta", "MÄcÄ«bas", "Darbs", "KustÄ«ba", "MÄjoklis", "PersonÄ«gais"]; init(habit: Habit?) { self.habit = habit; _title = State(initialValue: habit?.title ?? ""); _frequency = State(initialValue: habit?.frequency ?? .daily); _category = State(initialValue: habit?.category ?? "LabsajÅ«ta"); _isGoal = State(initialValue: habit?.isGoal ?? false); _targetDays = State(initialValue: habit?.targetDays ?? 30) }; var body: some View { NavigationStack { Form { Section("Paradums") { TextField("Paraduma nosaukums", text: $title); Picker("Kategorija", selection: $category) { ForEach(categories, id: \.self) { Text($0) } }; Picker("BieÅ¾ums", selection: $frequency) { ForEach(HabitFrequency.allCases) { Text($0.rawValue).tag($0) } } }; Section("Progress") { Toggle("Å is ir mÄ“rÄ·is", isOn: $isGoal); if isGoal { Stepper("MÄ“rÄ·is: \(targetDays) dienas", value: $targetDays, in: 1...365) } else { Text("Bez mÄ“rÄ·a ā€” vienkÄrÅi ikdienas lietiÅ†a.").font(.caption).foregroundStyle(AppColors.secondary) } } }.navigationTitle(habit == nil ? "Jauns paradums" : "RediÄ£Ä“t paradumu").toolbar { ToolbarItem(placement: .cancellationAction) { Button("Atcelt") { dismiss() } }; ToolbarItem(placement: .confirmationAction) { Button("SaglabÄt") { let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines); guard !cleanTitle.isEmpty else { return }; let value = habit ?? Habit(title: cleanTitle); if habit == nil { context.insert(value) }; value.title = cleanTitle; value.frequency = frequency; value.category = category; value.isGoal = isGoal; value.targetDays = targetDays; try? context.save(); dismiss() } } } } } }

struct CircularProgressView: View { let value: Double; var body: some View { ZStack { Circle().stroke(AppColors.pink, lineWidth: 8); Circle().trim(from: 0, to: min(1, max(0, value / 100))).stroke(AppColors.primary, style: StrokeStyle(lineWidth: 8, lineCap: .round)).rotationEffect(.degrees(-90)); Text("\(Int(value))%").font(.caption.bold()) }.frame(width: 58, height: 58) } }
struct ProfileView: View {
    @Environment(\.modelContext) private var context
    @Query private var goals: [Goal]
    @State private var addingGoal = false
    @State private var editingGoal: Goal?
    @State private var showingSettings = false

    @ViewBuilder
    private func goalRow(_ goal: Goal) -> some View {
        Button { editingGoal = goal } label: {
            HStack {
                CircularProgressView(value: goal.calculatedProgress)
                VStack(alignment: .leading) {
                    Text(goal.title).font(.headline)
                    goalSubtitle(goal)
                }
            }
        }
        .swipeActions {
            Button(role: .destructive) {
                context.delete(goal)
                try? context.save()
            } label: {
                Label("Dzēst", systemImage: "trash")
            }
        }
    }

    @ViewBuilder
    private func goalSubtitle(_ goal: Goal) -> some View {
        if goal.isMoneyGoal {
            Text("Naudas mērķis • \(goal.savedAmount, specifier: "%.2f")/\(goal.targetAmount, specifier: "%.2f") \(goal.currency)")
                .font(.caption)
                .foregroundStyle(AppColors.secondary)
        } else {
            Text(goal.category).font(.caption).foregroundStyle(AppColors.secondary)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Image(systemName: "heart.circle.fill")
                            .font(.system(size: 52))
                            .foregroundStyle(AppColors.primary)
                        VStack(alignment: .leading) {
                            Text("Vika").font(.title.bold())
                            Text("Tavs personīgais plānotājs").foregroundStyle(AppColors.secondary)
                        }
                    }
                }
                .listRowBackground(Color.clear)
                Section("Personīgie mērķi") {
                    ForEach(goals) { goal in goalRow(goal) }
                    Button { addingGoal = true } label: {
                        Label("Pievienot mērķi", systemImage: "plus")
                    }
                }
                Section("Iestatījumi") {
                    Button { showingSettings = true } label: {
                        Label("Datu drošība", systemImage: "lock.shield")
                    }
                    Button { AppServices.shared.notifications.openSettings() } label: {
                        Label("Paziņojumu iestatījumi", systemImage: "bell")
                    }
                }
                Section("Par Lietiņām") {
                    NavigationLink("Statistika") { StatisticsView() }
                    Text("Lietiņas 1.0 • Izveidots ar rūpēm")
                        .font(.caption).foregroundStyle(AppColors.secondary)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppColors.background)
            .navigationTitle("Profils")
            .sheet(isPresented: $addingGoal) { NavigationStack { GoalEditor(goal: nil) } }
            .sheet(item: $editingGoal) { goal in NavigationStack { GoalEditor(goal: goal) } }
            .sheet(isPresented: $showingSettings) { BackupSettingsView() }
        }
    }
}
struct GoalEditor: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    let goal: Goal?
    @State private var title: String
    @State private var description: String
    @State private var category: String
    @State private var targetDate: Date
    @State private var isMoney: Bool
    @State private var targetAmount: Double
    @State private var savedAmount: Double
    @State private var progress: Double
    @State private var currency: String

    init(goal: Goal?) {
        self.goal = goal
        _title = State(initialValue: goal?.title ?? "")
        _description = State(initialValue: goal?.goalDescription ?? "")
        _category = State(initialValue: goal?.category ?? "Personīgais")
        _targetDate = State(initialValue: goal?.targetDate ?? Calendar.current.date(byAdding: .month, value: 1, to: .now)!)
        _isMoney = State(initialValue: goal?.isMoneyGoal ?? false)
        _targetAmount = State(initialValue: goal?.targetAmount ?? 100)
        _savedAmount = State(initialValue: goal?.savedAmount ?? 0)
        _progress = State(initialValue: goal?.progress ?? 0)
        _currency = State(initialValue: goal?.currency ?? "EUR")
    }

    @ViewBuilder
    private var moneyFields: some View {
        TextField("Valūta", text: $currency)
        TextField("Mērķa summa", value: $targetAmount, format: .number)
            .keyboardType(.decimalPad)
        TextField("Sakrātā summa", value: $savedAmount, format: .number)
            .keyboardType(.decimalPad)
        ProgressView(value: targetAmount > 0 ? min(1, savedAmount / targetAmount) : 0)
            .tint(AppColors.primary)
    }

    @ViewBuilder
    private var progressFields: some View {
        Slider(value: $progress, in: 0...100, step: 1)
        Text("Progress: \(Int(progress))%")
    }

    private func save() {
        let clean = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }
        let value = goal ?? Goal(title: clean)
        if goal == nil { context.insert(value) }
        value.title = clean
        value.goalDescription = description
        value.category = category
        value.targetDate = targetDate
        value.isMoneyGoal = isMoney
        value.targetAmount = max(0, targetAmount)
        value.savedAmount = max(0, savedAmount)
        value.currency = currency
        value.progress = progress
        try? context.save()
        dismiss()
    }

    var body: some View {
        Form {
            TextField("Mērķis", text: $title)
            TextField("Apraksts", text: $description)
            TextField("Kategorija", text: $category)
            DatePicker("Mērķa datums", selection: $targetDate, displayedComponents: .date)
            Toggle("Naudas mērķis", isOn: $isMoney)
            if isMoney {
                moneyFields
            } else {
                progressFields
            }
        }
        .navigationTitle(goal == nil ? "Jauns mērķis" : "Rediģēt mērķi")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Atcelt") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Saglabāt") { save() }
            }
        }
    }
}
struct StatisticsView: View {
    @Query private var tasks: [TaskItem]
    @Query private var entries: [HabitEntry]

    private var completedTaskCount: Int { tasks.filter { $0.isCompleted }.count }
    private var completionRate: String {
        guard !tasks.isEmpty else { return "0%" }
        return "\(Int(Double(completedTaskCount) / Double(tasks.count) * 100))%"
    }
    private var days: [(String, Int)] {
        (0..<7).map { offset in
            let day = Calendar.current.date(byAdding: .day, value: -6 + offset, to: .now)!
            let count = tasks.filter {
                $0.isCompleted && Calendar.current.isDate($0.completedAt ?? $0.dueDate, inSameDayAs: day)
            }.count
            return (day.formatted(.dateTime.weekday(.abbreviated)), count)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Tava statistika").font(.largeTitle.bold())
                AppCard {
                    Chart {
                        ForEach(Array(days.enumerated()), id: \.offset) { _, day in
                            BarMark(
                                x: .value("Diena", day.0),
                                y: .value("Pabeigts", day.1)
                            )
                            .foregroundStyle(AppColors.primary)
                        }
                    }
                    .frame(height: 180)
                }
                AppCard {
                    VStack(alignment: .leading, spacing: 10) {
                        LabeledContent("Pabeigtas lietiņas", value: "\(completedTaskCount)")
                        LabeledContent("Izpildes līmenis", value: completionRate)
                        LabeledContent("Paradumu ieraksti", value: "\(entries.filter { $0.isCompleted }.count)")
                    }
                }
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("Statistika")
    }
}
struct BackupSettingsView: View { @Environment(\.dismiss) private var dismiss; @Environment(\.modelContext) private var context; @State private var automatic = UserDefaults.standard.object(forKey: "autoBackup") as? Bool ?? true; @State private var picker = false; @State private var restorePicker = false; @State private var message = ""; var body: some View { NavigationStack { Form { Section("Datu droÅÄ«ba") { Toggle("AutomÄtiskÄs rezerves kopijas", isOn: $automatic).onChange(of: automatic) { _, value in UserDefaults.standard.set(value, forKey: "autoBackup") }; Text("Rezerves kopijas tiek veidotas reizi dienÄ, kad LietiÅ†as tiek atvÄ“rtas. TÄs glabÄjas Ärpus lietotnes datiem.").font(.caption).foregroundStyle(AppColors.secondary) }; Section { Button("IzvÄ“lÄ“ties backup mapi") { picker = true }; Button("Izveidot rezerves kopiju tagad") { do { let url = try AppServices.shared.backups.create(container: context.container); message = "SaglabÄts: \(url.lastPathComponent)" } catch { message = "NeizdevÄs izveidot kopiju." } }; Button("Atjaunot no rezerves kopijas") { restorePicker = true }; if let date = UserDefaults.standard.object(forKey: "lastBackup") as? Date { LabeledContent("PÄ“dÄ“jÄ kopija", value: date.formatted(date: .abbreviated, time: .shortened)) }; if !message.isEmpty { Text(message).font(.caption) } } }.navigationTitle("Datu droÅÄ«ba").toolbar { Button("Gatavs") { dismiss() } }.sheet(isPresented: $picker) { FolderPicker() }.sheet(isPresented: $restorePicker) { RestorePicker(container: context.container) } } } }
struct FolderPicker: UIViewControllerRepresentable { @Environment(\.dismiss) private var dismiss; func makeUIViewController(context: Context) -> UIDocumentPickerViewController { let p = UIDocumentPickerViewController(forOpeningContentTypes: [.folder], asCopy: false); p.allowsMultipleSelection = false; p.delegate = context.coordinator; return p }; func updateUIViewController(_ controller: UIDocumentPickerViewController, context: Context) {}; func makeCoordinator() -> Coordinator { Coordinator(self) }; final class Coordinator: NSObject, UIDocumentPickerDelegate { let parent: FolderPicker; init(_ parent: FolderPicker) { self.parent = parent }; func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) { guard let url = urls.first else { return }; if url.startAccessingSecurityScopedResource() { UserDefaults.standard.set(url, forKey: "backupFolder"); url.stopAccessingSecurityScopedResource() }; parent.dismiss() } } }
struct RestorePicker: UIViewControllerRepresentable { let container: ModelContainer; @Environment(\.dismiss) private var dismiss; func makeUIViewController(context: Context) -> UIDocumentPickerViewController { let p = UIDocumentPickerViewController(forOpeningContentTypes: [.json], asCopy: true); p.delegate = context.coordinator; return p }; func updateUIViewController(_ controller: UIDocumentPickerViewController, context: Context) {}; func makeCoordinator() -> Coordinator { Coordinator(self) }; final class Coordinator: NSObject, UIDocumentPickerDelegate { let parent: RestorePicker; init(_ parent: RestorePicker) { self.parent = parent }; func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) { guard let url = urls.first else { return }; do { try AppServices.shared.backups.restore(from: url, container: parent.container) } catch { print("Restore failed: \(error)") }; parent.dismiss() } } }
