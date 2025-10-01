"use strict"

module.exports = function (RED) {
  const dav = require('dav')
  // const webdav = require('webdav')
  // const fs = require('fs')
  // const IcalExpander = require('ical-expander')
  // const moment = require('moment')
  // const https = require('https')
  const tsdav = require('tsdav')

  function NextcloudConfigNode(config) {
    RED.nodes.createNode(this, config)
    this.address = config.address
    this.insecure = config.insecure
  }
  RED.nodes.registerType('nextcloud-credentials', NextcloudConfigNode, {
    credentials: {
      user: { type: 'text' },
      pass: { type: 'password' }
    }
  })

  // vCard De-Escape Hilfsfunktion
  function vcardDeEscape(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }


  // function NextcloudCalDav(config) {
  //   RED.nodes.createNode(this, config)
  //   this.server = RED.nodes.getNode(config.server)
  //   this.calendar = config.calendar
  //   this.pastWeeks = config.pastWeeks || 0
  //   this.futureWeeks = config.futureWeeks || 4
  //   const node = this

  //   node.on('input', (msg) => {
  //     let startDate = moment().startOf('day').subtract(this.pastWeeks, 'weeks')
  //     let endDate = moment().endOf('day').add(this.futureWeeks, 'weeks')
  //     const filters = [{
  //       type: 'comp-filter',
  //       attrs: { name: 'VCALENDAR' },
  //       children: [{
  //         type: 'comp-filter',
  //         attrs: { name: 'VEVENT' },
  //         children: [{
  //           type: 'time-range',
  //           attrs: {
  //             start: startDate.format('YYYYMMDD[T]HHmmss[Z]'),
  //             end: endDate.format('YYYYMMDD[T]HHmmss[Z]')
  //           }
  //         }]
  //       }]
  //     }]
  //     // dav.debug.enabled = true;
  //     const xhr = new dav.transport.Basic(
  //       new dav.Credentials({
  //         username: node.server.credentials.user,
  //         password: node.server.credentials.pass
  //       })
  //     )
  //     // Server + Basepath
  //     let calDavUri = node.server.address + '/remote.php/dav/calendars/'
  //     // User
  //     calDavUri += node.server.credentials.user + '/'
  //     dav.createAccount({ server: calDavUri, xhr: xhr, loadCollections: true, loadObjects: true })
  //       .then(function (account) {
  //         if (!account.calendars) {
  //           node.error('Nextcloud:CalDAV -> no calendars found.')
  //           return
  //         }
  //         // account instanceof dav.Account
  //         account.calendars.forEach(function (calendar) {
  //           // Wenn Kalender gesetzt ist, dann nur diesen abrufen
  //           let calName = msg.calendar || node.calendar
  //           if (!calName || !calName.length || (calName && calName.length && calName === calendar.displayName)) {
  //             dav.listCalendarObjects(calendar, { xhr: xhr, filters: filters })
  //               .then(function (calendarEntries) {
  //                 let msg = { 'payload': { 'name': calendar.displayName, 'data': [] } }
  //                 calendarEntries.forEach(function (calendarEntry) {
  //                   try {
  //                     const ics = calendarEntry.calendarData
  //                     const icalExpander = new IcalExpander({ ics, maxIterations: 100 })
  //                     const events = icalExpander.between(startDate.toDate(), endDate.toDate())
  //                     msg.payload.data = msg.payload.data.concat(convertEvents(events))
  //                   } catch (error) {
  //                     node.error('Error parsing calendar data: ' + error)
  //                   }
  //                 })
  //                 node.send(msg)
  //               }, function () {
  //                 node.error('Nextcloud:CalDAV -> get ics went wrong.')
  //               })
  //           }
  //         })
  //       }, function () {
  //         node.error('Nextcloud:CalDAV -> get calendars went wrong.')
  //       })
  //   })

  //   function convertEvents(events) {
  //     const mappedEvents = events.events.map(_convertEvent)
  //     const mappedOccurrences = events.occurrences.map(_convertEvent)
  //     return [].concat(mappedEvents, mappedOccurrences)
  //   }

  //   function _convertEvent(e) {
  //     if (e) {
  //       let startDate = e.startDate.toString()
  //       let endDate = e.endDate.toString()

  //       if (e.item) {
  //         e = e.item
  //       }
  //       if (e.duration.wrappedJSObject) {
  //         delete e.duration.wrappedJSObject
  //       }

  //       // vCard De-Escape Hilfsfunktion
  //       function vcardDeEscape(str) {
  //         if (typeof str !== 'string') return str;
  //         return str
  //           .replace(/\\n/g, '\n')
  //           .replace(/\\,/g, ',')
  //           .replace(/\\;/g, ';')
  //           .replace(/\\\\/g, '\\');
  //       }

  //       return {
  //         startDate: startDate,
  //         endDate: endDate,
  //         summary: vcardDeEscape(e.summary || ''),
  //         description: vcardDeEscape(e.description || ''),
  //         attendees: e.attendees,
  //         duration: e.duration.toICALString(),
  //         durationSeconds: e.duration.toSeconds(),
  //         location: vcardDeEscape(e.location || ''),
  //         organizer: vcardDeEscape(e.organizer || ''),
  //         uid: e.uid || '',
  //         isRecurring: false,
  //         allDay: ((e.duration.toSeconds() % 86400) === 0)
  //       }
  //     }
  //   }
  // }
  // RED.nodes.registerType('nextcloud-caldav', NextcloudCalDav)

  function NextcloudCardDav(config) {
    RED.nodes.createNode(this, config)
    this.server = RED.nodes.getNode(config.server)
    this.addressBook = config.addressBook
    const node = this

    node.on('input', async (msg) => {

      try {


        // Server + Basepath
        let cardDavUri = node.server.address + '/remote.php/dav/addressbooks/'
        // User
        // cardDavUri += node.server.credentials.user + '/'



        const client = await tsdav.createDAVClient({
          serverUrl: cardDavUri,
          credentials: {
            username: node.server.credentials.user,
            password: node.server.credentials.pass
          },
          defaultAccountType: 'carddav',
          authMethod: 'Basic',

        });

        const addressBooks = await client.fetchAddressBooks({
        });


        // get selected address book
        let selectedAddressBook = null;
        let abName = msg.addressBook || node.addressBook;
        if (abName && abName.length) {
          selectedAddressBook = addressBooks.find(ab => ab.displayName === abName);
          if (!selectedAddressBook) {
            node.error(`Nextcloud:CardDAV -> Address book "${abName}" not found. Available address books: ${addressBooks.map(ab => ab.displayName).join(', ')}`);
            return;
          }
        } else {
          // if no address book specified, use the first one
          selectedAddressBook = addressBooks[0];
        }

        if (!selectedAddressBook) {
          node.error('Nextcloud:CardDAV -> No address books found.');
          return;
        }




        const cards = await client.fetchVCards({
          addressBook: selectedAddressBook,

        })
        const vcfList = { 'payload': { 'name': selectedAddressBook.displayName, 'data': [] } };
        cards.forEach(card => {


          const keyValue = card.data.split('\n');

          // vCard line folding: lines starting with space or tab are continuations of previous line
          const joinedKeyValue = [];
          for (let i = 0; i < keyValue.length; i++) {
            const line = keyValue[i];
            if (/^[ \t]/.test(line)) {
              // continuation line: remove leading whitespace and append
              if (joinedKeyValue.length > 0) {
                joinedKeyValue[joinedKeyValue.length - 1] += line.replace(/^\s+/, '');
              }
            } else {
              joinedKeyValue.push(line);
            }
          }


          let vcfJson = {};
          vcfJson['raw'] = card.data;
          let beginFound = false;
          let endFound = false;
          for (let x = 0; x < joinedKeyValue.length; x++) {
            const [keyRaw, value] = joinedKeyValue[x].split(/:(.*)/)
              .map(s => s.trim());

            const [key, ...rest] = keyRaw.split(';');
            const keyCategories = Object.fromEntries(rest.map(part => {
              const [k, v] = part.split('=');
              return [k.toLowerCase(), v.toLowerCase()];
            }));



            if (key === 'BEGIN' && value === 'VCARD') {
              beginFound = true;
              continue;
            } else if (!beginFound) {
              // skip all lines until BEGIN:VCARD is found
              node.warn(`Skipping line before BEGIN:VCARD: key=${key}, value=${value}`);
              continue;
            }

            if (key === 'END' && value === 'VCARD') {
              endFound = true;
              break;
            }

            if (key == 'FN') {
              // full name
              vcfJson['fullName'] = vcardDeEscape(value);
            } else if (key == 'N') {
              // name parts
              const nameParts = value.split(';');
              vcfJson['lastName'] = vcardDeEscape(nameParts[0] || '');
              vcfJson['firstName'] = vcardDeEscape(nameParts[1] || '');
              vcfJson['additionalNames'] = vcardDeEscape(nameParts[2] || '');
              vcfJson['namePrefix'] = vcardDeEscape(nameParts[3] || '');
              vcfJson['nameSuffix'] = vcardDeEscape(nameParts[4] || '');
            } else if (key == 'TEL' || key.startsWith('TEL;')) {
              // phone number
              if (!vcfJson['phoneNumbers']) {
                vcfJson['phoneNumbers'] = {};
              }
              const type = keyCategories['type'] || 'other';
              if (!vcfJson['phoneNumbers'][type]) {
                vcfJson['phoneNumbers'][type] = [];
              }
              vcfJson['phoneNumbers'][type].push(value);
            } else if (key == 'EMAIL' || key.startsWith('EMAIL;')) {
              // email address
              if (!vcfJson['emailAddresses']) {
                vcfJson['emailAddresses'] = {};
              }
              const type = keyCategories['type'] || 'other';
              if (!vcfJson['emailAddresses'][type]) {
                vcfJson['emailAddresses'][type] = [];
              }
              vcfJson['emailAddresses'][type].push(value);
            } else if (key == 'ADR' || key.startsWith('ADR;')) {
              // address
              if (!vcfJson['addresses']) {
                vcfJson['addresses'] = {};
              }
              let adrParts = value.split(';');
              let address = {
                poBox: vcardDeEscape(adrParts[0] || ''),
                extendedAddress: vcardDeEscape(adrParts[1] || ''),
                streetAddress: vcardDeEscape(adrParts[2] || ''),
                locality: vcardDeEscape(adrParts[3] || ''),
                region: vcardDeEscape(adrParts[4] || ''),
                postalCode: vcardDeEscape(adrParts[5] || ''),
                countryName: vcardDeEscape(adrParts[6] || '')
              };
              const type = keyCategories['type'] || 'other';
              if (!vcfJson['addresses'][type]) {
                vcfJson['addresses'][type] = [];
              }
              vcfJson['addresses'][type].push(address);
            } else if (key == 'ORG') {
              vcfJson['organization'] = vcardDeEscape(value);
            } else if (key == 'TITLE') {
              vcfJson['jobTitle'] = vcardDeEscape(value);
            } else if (key == 'URL' || key.startsWith('URL;')) {
              // url
              if (!vcfJson['urls']) {
                vcfJson['urls'] = {};
              }
              const type = keyCategories['type'] || 'other';
              // no type, use 'other'
              if (!vcfJson['urls'][type]) {
                vcfJson['urls'][type] = [];
              }
              vcfJson['urls'][type].push(value);

            } else if (key == 'NOTE') {
              vcfJson['note'] = value;
            } else if (key == 'BDAY') {
              vcfJson['birthday'] = value;
            } else if (key == 'REV') {
              vcfJson['revision'] = value;
            } else if (key == 'UID') {
              vcfJson['uid'] = value;
            } else if (key == 'PHOTO' || key.startsWith('PHOTO;')) {
              // photo
              if (/;ENCODING=b;/.test(key)) {
                // base64 encoded
                vcfJson['photo'] = value;
              } else if (/;VALUE=uri;/.test(key)) {
                vcfJson['photoUrl'] = value;
              }
            } else if (vcfJson[key] === undefined) {
              // other properties
              vcfJson[key.toLowerCase()] = value;
            }
          }
          if (!endFound) {
            node.error('END:VCARD not found, skipping entry');
            node.error(JSON.stringify(card));
            return;
          }
          if (!vcfJson['fullName']) {
            vcfJson['fullName'] = (vcfJson['firstName'] ?? '') + ' ' + (vcfJson['lastName'] ?? '');
          }




          vcfList.payload.data.push(vcfJson);
        });
        node.send(vcfList);
      } catch (error) {
        node.error('Nextcloud:CardDAV -> Error fetching address books: ' + error);
        // print stack trace
        console.error(error);
      }
    })

    return; // Old dav code is deprecated, but left here for reference
  }

  RED.nodes.registerType('nextcloud-carddav', NextcloudCardDav)

  //   function NextcloudWebDavList(config) {
  //     RED.nodes.createNode(this, config)
  //     this.server = RED.nodes.getNode(config.server)
  //     this.directory = config.directory
  //     const node = this

  //     node.on('input', (msg) => {
  //       const webDavUri = node.server.address + '/remote.php/webdav/'
  //       const client = webdav(webDavUri, node.server.credentials.user, node.server.credentials.pass)
  //       let directory = ''
  //       if (msg.directory) {
  //         directory = '/' + msg.directory
  //       } else if (node.directory && node.directory.length) {
  //         directory = '/' + node.directory
  //       }
  //       directory = directory.replace('//', '/')

  //       // check option for self signed certs
  //       const option = {}
  //       if (node.server.insecure) {
  //         option.agent = new https.Agent({ rejectUnauthorized: false })
  //       }
  //       client.getDirectoryContents(directory, option)
  //         .then(function (contents) {
  //           node.send({ 'payload': contents })
  //         }, function (error) {
  //           node.error('Nextcloud:WebDAV -> get directory content went wrong.' + JSON.stringify(error))
  //         })
  //     })
  //   }
  //   RED.nodes.registerType('nextcloud-webdav-list', NextcloudWebDavList)

  //   function NextcloudWebDavOut(config) {
  //     RED.nodes.createNode(this, config)
  //     this.server = RED.nodes.getNode(config.server)
  //     this.filename = config.filename
  //     const node = this

  //     node.on('input', (msg) => {
  //       const webDavUri = node.server.address + '/remote.php/webdav/'
  //       const client = webdav(webDavUri, node.server.credentials.user, node.server.credentials.pass)
  //       let filename = ''
  //       if (msg.filename) {
  //         filename = '/' + msg.filename
  //       } else if (node.filename && node.filename.length) {
  //         filename = '/' + node.filename
  //       } else {
  //         node.error('Nextcloud:WebDAV -> no filename specified.')
  //         return
  //       }
  //       filename = filename.replace('//', '/')

  //       // check option for self signed certs
  //       const option = {}
  //       if (node.server.insecure) {
  //         option.agent = new https.Agent({ rejectUnauthorized: false })
  //       }
  //       client.getFileContents(filename, option)
  //         .then(function (contents) {
  //           node.send({ 'payload': contents })
  //         }, function (error) {
  //           node.error('Nextcloud:WebDAV -> get file went wrong.' + JSON.stringify(error))
  //         })
  //     })
  //   }
  //   RED.nodes.registerType('nextcloud-webdav-out', NextcloudWebDavOut)

  //   function NextcloudWebDavIn(config) {
  //     RED.nodes.createNode(this, config)
  //     this.server = RED.nodes.getNode(config.server)
  //     this.directory = config.directory
  //     this.filename = config.filename
  //     const node = this

  //     node.on('input', (msg) => {
  //       // Read upload file
  //       let filename = node.filename
  //       if (msg.filename) {
  //         filename = msg.filename
  //       }
  //       const name = filename.substr((filename.lastIndexOf('/') + 1), filename.length)
  //       const file = fs.readFileSync(filename)
  //       // Set upload directory
  //       let directory = '/'
  //       if (msg.directory) {
  //         directory += msg.directory + '/'
  //       } else if (node.directory && node.directory.length) {
  //         directory += node.directory + '/'
  //       }
  //       directory = directory.replace('//', '/')

  //       const webDavUri = node.server.address + '/remote.php/webdav/'
  //       const client = webdav(webDavUri, node.server.credentials.user, node.server.credentials.pass)

  //       // check option for self signed certs
  //       const option = {}
  //       if (node.server.insecure) {
  //         option.agent = new https.Agent({ rejectUnauthorized: false })
  //       }

  //       client.putFileContents(directory + name, file, { format: 'binary' }, option)
  //         .then(function (contents) {
  //           console.log(contents)
  //           node.send({ 'payload': JSON.parse(contents) })
  //         }, function () {
  //           node.error('Nextcloud:WebDAV -> send file went wrong.')
  //         })
  //     })
  //   }
  //   RED.nodes.registerType('nextcloud-webdav-in', NextcloudWebDavIn)
}
