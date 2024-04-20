import { addContacts } from '../src/phonebook/repo';
import * as F from './env/factories';
import { ContactDetails } from '../src/phonebook/types';

const generateDummydata = async (userId: Number) => {
    for (let i = 0; i < 10; i++) {
        const data = F.fakeUser({});
        const contact = {
            contactName: data.name,
            phoneNumber: data.phoneNumber,
        };
        const contactsData: ContactDetails = {
            contact: contact,
            userId: userId,
        };
        const constcsResp = await addContacts(contactsData);
        console.log(constcsResp);
    }
};

const generateSameContactsWithDifferentName = async (userId1, userId2) => {
    let constcsResp1: any;
    let constcsResp2: any;

    for (let i = 0; i < 5; i++) {
        const data1 = F.fakeUser({});
        const contact1 = {
            contactName: data1.name,
            phoneNumber: data1.phoneNumber,
        };
        const contactsData1: ContactDetails = {
            contact: contact1,
            userId: userId1,
        };
        constcsResp1 = await addContacts(contactsData1);

        const data2 = F.fakeUser({});
        const contact = {
            contactName: data2.name,
            phoneNumber: data1.phoneNumber,
        };
        const contactsData2: ContactDetails = {
            contact: contact,
            userId: userId2,
        };
        constcsResp2 = await addContacts(contactsData2);
    }

    console.log('constcsResp1', constcsResp1, 'constcsResp2', constcsResp2);
};

//  generateDummydata(1);

generateSameContactsWithDifferentName(1, 2);
