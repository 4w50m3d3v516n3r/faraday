// Faraday Penetration Test IDE
// Copyright (C) 2013  Infobyte LLC (http://www.infobytesec.com/)
// See the file 'doc/LICENSE' for the license information

angular.module('faradayApp')
    .factory('Vuln', ['BASEURL', '$http', '$q', 'attachmentsFact', function(BASEURL, $http, $q, attachmentsFact) {
        Vuln = function(ws, data){
            if(data) {
                if(data.name === undefined || data.name === "") {
                    throw new Error("Unable to create Vuln without a name");
                }
                this.set(ws, data);
            }
        };

        Vuln.prototype = {
            set: function(ws, data) {
                var impact = {
                    accountability: false,
                    availability: false,
                    confidentiality: false,
                    integrity: false
                },
                metadata = {},
                now = new Date(),
                date = now.getTime();

                // new vuln
                if(data._id === undefined) {
                    var id = CryptoJS.SHA1(data.name + "." + data.desc).toString();

                    this._id = data.parent + "." + id;
                    this.obj_id = id;

                    metadata.update_time = date;
                    metadata.update_user = "";
                    metadata.update_action = 0;
                    metadata.creator = "UI Web";
                    metadata.create_time = date;
                    metadata.update_controller_action = "UI Web New";
                    metadata.owner = "";
                } else {
                    this._id = data._id;
                    this.obj_id = data._id;
                    if(data._rev !== undefined) this._rev = data._rev;

                    if(this.metadata !== undefined) metadata = this.metadata; 
                    metadata.update_time = date;
                    metadata.update_user = "";
                    metadata.update_action = 0;
                }

                this.date = date;
                this.metadata = metadata;
                this.owner = "";
                this.type = "Vulnerability";
                this.ws = ws;

                // user-generated content
                if(data._attachments !== undefined && data._attachments.length > 0) this._attachments = data._attachments;
                if(data.data !== undefined) this.data = data.data;
                if(data.desc !== undefined) this.desc = data.desc;
                if(data.easeofresolution !== undefined) this.easeofresolution = data.easeofresolution;
                if(data.impact !== undefined) {
                    this.impact = data.impact;
                    for(var prop in data.impact) {
                        if(data.impact.hasOwnProperty(prop)) {
                            this.impact[prop] = data.impact[prop];
                        }
                    }
                }
                if(data.name !== undefined && data.name !== "") this.name = data.name;
                if(data.owned !== undefined) this.owned = data.owned;
                if(data.parent !== undefined) this.parent = data.parent;
                if(data.refs !== undefined) this.refs = data.refs;
                if(data.resolution !== undefined) this.resolution = data.resolution;
                if(data.severity !== undefined) this.severity = data.severity;
            },
            remove: function() {
                var self = this,
                url = BASEURL + self.ws + "/" + self._id + "?rev=" + self._rev;
                return $http.delete(url);
            },
            update: function(data) {
                var self = this,
                url = BASEURL + self.ws + "/" + self._id,
                vuln = new Vuln(self.ws, self);
                vuln.set(self.ws, data);
                return $http.put(url, vuln)
                    .success(function(response) {
                        self.set(self.ws, data);
                        self._rev = response.rev;
                    });
            },
            populate: function() {
                var self = this,
                vuln = {};

                vuln._id = self._id;
                if(self._rev !== undefined) vuln._rev = self._rev;
                vuln.data = self.data;
                vuln.desc = self.desc;
                vuln.easeofresolution = self.easeofresolution;
                vuln.impact = self.impact;
                vuln.metadata = self.metadata;
                vuln.name = self.name;
                vuln.obj_id = self.obj_id;
                vuln.owned = self.owned;
                vuln.owner = self.owner;
                vuln.parent = self.parent;
                vuln.refs = self.refs;
                vuln.resolution = self.resolution;
                vuln.severity = self.severity;
                vuln.type = self.type;

                return vuln;
            },
            save: function() {
                var deferred = $q.defer(),
                loadAtt,
                self = this,
                url = BASEURL + self.ws + "/" + self._id;
                vuln = self.populate();

                if(self._attachments !== undefined) {
                    loadAtt = _loadAttachments(self._attachments);
                }

                $q.when(loadAtt).then(function(atts) {
                    vuln._attachments = atts;
                    
                    $http.put(url, vuln)
                        .success(function(data) {
                            self._rev = data.rev;
                            self._attachments = Object.keys(vuln._attachments);
                            deferred.resolve();
                        }, function() {
                            deferred.reject();
                        });
                }, function() {
                    $http.put(url, vuln)
                        .success(function(data) {
                            self._rev = data.rev;
                            deferred.resolve();
                        }, function() {
                            deferred.reject();
                        });
                });

                return deferred.promise;
            }
        }

        _loadAttachments = function(evidence) {
            // the list of evidence may have mixed objects, some of them already in CouchDB, some of them new
            // new attachments are of File type and need to be processed by attachmentsFact.loadAttachments 
            // old attachments are of type String (file name) and need to be processed by attachmentsFact.getStubs
            var attachments = {},
            deferred = $q.defer(),
            files = [],
            promises = [],
            stubs = [];

            for(var name in evidence) {
                if(evidence[name] instanceof File) {
                    files.push(evidence[name]);
                } else {
                    stubs.push(name);
                }
            }

            if(stubs.length > 0) promises.push(attachmentsFact.getStubs(ws, vuln.id, stubs));
            if(files.length > 0) promises.push(attachmentsFact.loadAttachments(files));

            $q.all(promises).then(function(result) {
                result.forEach(function(atts) {
                    for(var name in atts) {
                        attachments[name] = atts[name];
                    }
                });
                deferred.resolve(attachments);
            }, function() {
                deferred.reject("Unable to load attachments");
            });

            return deferred.promise;
        };

        return Vuln;
    }]);
