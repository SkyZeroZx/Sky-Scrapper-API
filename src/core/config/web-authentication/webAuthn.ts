import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types';
import { User } from '../../../database';
import { Authentication } from '../../../database/auth/entities/authentication.entity';
// import { Authentication } from '../../auth/entities/autentication.entity';

// Utils for Web Authentication

// Human-readable title for your website
const rpName = process.env.RP_NAME;
// A unique identifier for your website
const rpID = process.env.RP_ID;

const rpIDArray = JSON.parse(process.env.RP_ID_ARRAY ? process.env.RP_ID_ARRAY : '[]');

// The URL at which registrations and authentications should occur
const origin = JSON.parse(process.env.ORIGIN ? process.env.ORIGIN : '[]');

export function generateRegistrationOption(user: User, userAuthenticators: Authentication[]) {
  return generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id.toString(),
    userName: user.email,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'direct',
    authenticatorSelection: {
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
    extensions: {
      hmacCreateSecret: true,
    },
    // Prevent users from re-registering existing authenticators
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID.buffer,
      type: 'public-key',
      transports: ['internal'],
      //   rpID : rpIDArray
    })),
  });
}

export async function verifyAuthWeb(
  body: RegistrationResponseJSON,
  expectedChallenge: string,
): Promise<VerifiedRegistrationResponse> {
  try {
    return await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpIDArray,
    });
  } catch (error) {
    console.error(error);
    throw new Error('Error verifyRegistrationResponse');
  }
}

export async function generateAuthenticationOption(userAuthenticators: Authentication[]) {
  console.log(
    'generating authentication option',
    //   Buffer.from(new Uint8Array("userAuthenticators[0].credentialID")),
  );

  return generateAuthenticationOptions({
    rpID,
    // Require users to use a previously-registered authenticator
    allowCredentials: userAuthenticators.map((_authenticator) => {
      return {
        id: _authenticator.credentialID.buffer,
        type: 'public-key',
        transports: ['internal'],
        authenticatorSelection: {
          userVerification: 'preferred',
          authenticatorAttachment: 'platform',
        },
      };
    }),
    userVerification: 'preferred',
  });
}

export async function verifyAuthenticationOption(
  body: AuthenticationResponseJSON,
  expectedChallenge: string,
  authenticator: Authentication,
): Promise<VerifiedAuthenticationResponse> {
  try {
    return verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpIDArray,
      authenticator: {
        credentialPublicKey: authenticator.credentialPublicKey.buffer as Uint8Array,
        credentialID: authenticator.credentialID.buffer as Uint8Array,
        counter: 0,
      },
    });
  } catch (error) {
    console.error(error);
  }
}
