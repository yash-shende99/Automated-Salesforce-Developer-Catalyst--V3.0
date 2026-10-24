SampleDataController.importSampleData();
System.debug('Sample data imported! Brokers: ' + [SELECT COUNT() FROM Broker__c] + ', Properties: ' + [SELECT COUNT() FROM Property__c]);
