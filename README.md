# node-red-contrib-nextcloud

A fork of [Torsten Kühnels node-red-contrib-nextcloud](https://github.com/kuehnelbs/node-red-contrib-nextcloud). 

I updated the cardav node.

It now returns a JSON in the form of:
```json
{
    name: 'the name of the adress book',
    data:[
         {
            "raw": "BEGIN:VCARD\r\nVERSION:3.0\r\n…\r\nEND:VCARD",
            "VERSION": "3.0",
            "PRODID": "-//Sabre//Sabre VObject 4.5.6//EN",
            "lastName": "…",
            "firstName": "…",
            "additionalNames": "",
            "namePrefix": "",
            "nameSuffix": "",
            "emailAddresses": {
                "other": [
                    "…@….de"
                ]
            },
            "organization": "Some organisation",
            "phoneNumbers": {
                "cell": [
                    "+49 …"
                ],
                "work": [
                    "+49 …"
                ]
            },
            "uid": "…",
            "fullName": "…"
        },
    ]
}

```

For now only carddav is working.