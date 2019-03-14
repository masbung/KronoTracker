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

        self.darkModeOn = ko.observable(JSON.parse(localStorage.getItem("darkModeOn")));
        self.oldDarkModeOn = ko.observable(self.darkModeOn());

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
            self.darkModeOn(self.oldDarkModeOn());

            if (self.darkModeOn()) {
                $('head').append('<link rel="stylesheet" href="Style/theme-dark.css" type="text/css" />');                
            }
            else {
                $('head').find('link[href="Style/theme-dark.css"]').remove();                
            }
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
                timerType: "Sb"
            }));

            localStorage.setItem("longBreakSetting", JSON.stringify({
                minutes: self.longBreak(),
                seconds: 0,
                timerType: "Lb"
            }));

            if(self.darkModeOn()){
                localStorage.setItem("darkModeOn", true);
            }else{
                localStorage.setItem("darkModeOn", false);
            }

            location.reload();
        }

        self.darkMode = function () {
            if ($('head').find('link[href="Style/theme-dark.css"]').length <= 0) {
                $('head').append('<link rel="stylesheet" href="Style/theme-dark.css" type="text/css" />');                
            }
            else {
                $('head').find('link[href="Style/theme-dark.css"]').remove();                
            }

            return true;
        }
    }

    var vm2 = new SettingsModalViewModel();

    ko.applyBindings(vm2, document.getElementById('modalSettings'));
});