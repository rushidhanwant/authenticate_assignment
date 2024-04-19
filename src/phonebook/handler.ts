import { Either, isLeft, right, left } from 'fp-ts/lib/Either';
import { markSpamFailed } from '../logEvents';
import * as _ from 'ramda';
import * as repo from './repo';
import { SpamData, SpamCount, SpamError, SpamDetails, PhoneNumberSchema } from './types';

export const checkIfNumberExists = async (number: string): Promise<boolean> => {
    const numberDetails = await repo.getNumberDetails(number);
    if (_.isNil(numberDetails)) {
        return false;
    }
    return true;
}

export const getOrAddPhoneNumber = async (number: string): Promise<PhoneNumberSchema> => {
    const numberExist = await checkIfNumberExists(number);

    let newPhoneNumber: PhoneNumberSchema;
    if (!numberExist) {
        newPhoneNumber = await repo.addPhoneNumber(number);
    }
    else {
        newPhoneNumber = await repo.getNumberDetails(number);
    }
    return newPhoneNumber;
}

export const incrementSpamCount = async (spamData: SpamData) : Promise<number> => {
    const numberDetails = await repo.getNumberDetails(spamData.phoneNumber);
    if(spamData.spam) {
        return numberDetails.spam_count + 1;
    }
    return numberDetails.spam_count
}
    

export const markNumberSpam = async (
    spamData: SpamData,
): Promise<Either<SpamError, SpamCount>> => {

    try {
        const numberDetails = await getOrAddPhoneNumber(spamData.phoneNumber);
        const spamCount = await incrementSpamCount(spamData);
        
        const spamDetails: SpamDetails = {
            phoneId:numberDetails.id,
            phoneNumber:spamData.phoneNumber,
            userId:spamData.userId,
            spamCount: spamCount
        }

        const spamResponse = await repo.markNumberSpam(spamDetails);

        if(isLeft(spamResponse)){
            return spamResponse;
        }
        
        return right(spamResponse.right)

    } catch (err: any) {
        markSpamFailed(err);
        return left('unExpectedError')
    }
};
