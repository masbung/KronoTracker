document.addEventListener("DOMContentLoaded", function (event) {    

    function SettingsViewModel() {
        let self = this;        

        self.showSettings = function () {
            $('#modalSettings').modal({ backdrop: 'static', keyborad: false, show: true });
        }        
    }

    var vm1 = new SettingsViewModel();

    ko.applyBindings(vm1, document.getElementById('settingsNav'));

    function SettingsModalViewModel() {
        let self = this;

        self.pomodoro = ko.observable();
        self.oldPomodoro = ko.observable();

        self.pomodoro.subscribe(function (newValue) {
            if (!newValue || newValue < 0) {
                self.pomodoro(1);
            }
        })

        self.longBreak = ko.observable();
        self.oldLongBreak = ko.observable();

        self.longBreak.subscribe(function (newValue) {
            if (!newValue || newValue < 0) {
                self.longBreak(1);
            }
        })

        self.shortBreak = ko.observable();
        self.oldShortBreak = ko.observable();

        self.shortBreak.subscribe(function (newValue) {
            if (!newValue || newValue < 0) {
                self.shortBreak(1);
            }
        })

        let pomodoroMinutes = JSON.parse(localStorage.getItem("pomodoroSetting"));

        self.pomodoro(pomodoroMinutes.minutes);
        self.oldPomodoro(pomodoroMinutes.minutes);        

        let shrotBreakMinutes = JSON.parse(localStorage.getItem("shrotBreakSetting"));

        self.shortBreak(shrotBreakMinutes.minutes);
        self.oldShortBreak(shrotBreakMinutes.minutes);

        let longBreakMinutes = JSON.parse(localStorage.getItem("longBreakSetting"));

        self.longBreak(longBreakMinutes.minutes);
        self.oldLongBreak(longBreakMinutes.minutes);

        self.cancelSettings = function () {
            $('#modalSettings').modal('hide');
            self.pomodoro(self.oldPomodoro());
            self.shortBreak(self.oldShortBreak());
            self.longBreak(self.oldLongBreak());
        }

        self.saveSettings = function () {            
            localStorage.setItem("pomodoroSetting", JSON.stringify({
                minutes: self.pomodoro(),
                seconds: 0,
                timerType: "Pt"
            }));

            localStorage.setItem("shrotBreakSetting", JSON.stringify({
                minutes: self.shortBreak(),
                seconds: 0,
                timerType: "Pt"
            }));

            localStorage.setItem("longBreakSetting", JSON.stringify({
                minutes: self.longBreak(),
                seconds: 0,
                timerType: "Pt"
            }));

            location.reload();
        }
    }

    var vm2 = new SettingsModalViewModel();

    ko.applyBindings(vm2, document.getElementById('modalSettings'));
});