CookieConsent.run({
  guiOptions: {
    consentModal: {
      layout: 'box inline',
      position: 'bottom left'
    },
    preferencesModal: {
      layout: 'box'
    }
  },

  categories: {
    necessary: {
      enabled: true,
      readOnly: true
    },
    analytics: {},
    marketing: {}
  },

  language: {
    default: 'de',
    translations: {
      de: {
        consentModal: {
          title: 'Wir verwenden Cookies',
          description: 'Wir nutzen Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. Einige sind technisch notwendig, andere helfen uns, die Website zu verbessern. <a href="pages/datenschutz.html">Datenschutzerklärung</a>',
          acceptAllBtn: 'Alle akzeptieren',
          acceptNecessaryBtn: 'Nur notwendige',
          showPreferencesBtn: 'Einstellungen verwalten'
        },
        preferencesModal: {
          title: 'Cookie-Einstellungen',
          acceptAllBtn: 'Alle akzeptieren',
          acceptNecessaryBtn: 'Nur notwendige',
          savePreferencesBtn: 'Einstellungen speichern',
          closeIconLabel: 'Schließen',
          sections: [
            {
              title: 'Cookie-Nutzung',
              description: 'Wir verwenden Cookies, um die grundlegenden Funktionen der Website sicherzustellen und Ihr Online-Erlebnis zu verbessern. Sie können für jede Kategorie wählen, ob Sie diese zulassen möchten.'
            },
            {
              title: 'Technisch notwendige Cookies',
              description: 'Diese Cookies sind für das ordnungsgemäße Funktionieren der Website erforderlich und können nicht deaktiviert werden.',
              linkedCategory: 'necessary'
            },
            {
              title: 'Analyse-Cookies',
              description: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln und melden.',
              linkedCategory: 'analytics'
            },
            {
              title: 'Marketing-Cookies',
              description: 'Diese Cookies werden verwendet, um Werbung für Sie relevanter zu machen. Sie können auch dazu dienen, die Häufigkeit einer Anzeige zu begrenzen.',
              linkedCategory: 'marketing'
            },
            {
              title: 'Weitere Informationen',
              description: 'Bei Fragen zum Thema Datenschutz und Cookies können Sie uns jederzeit <a href="pages/impressum.html">kontaktieren</a>.'
            }
          ]
        }
      }
    }
  }
});
