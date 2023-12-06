export enum UsersMessages {
  ValidationError = 'Validation Error',
  EmailOrPasswordIsIncorrect = 'Email or password is incorrect',
  NameIsRequired = 'Name is required',
  NameMustBeAString = 'Name must be a string',
  NameLengthRequired = 'Name length must be from 1 to 100 characters',
  EmailAlreadyExists = 'Email already exists',
  EmailIsRequired = 'Email is required',
  EmailIsInvalid = 'Email is invalid',
  PasswordIsRequired = 'Password is required',
  PasswordMustBeAString = 'Password must be a string',
  PasswordLengthRequired = 'Password length must be from 6 to 50 characters',
  PasswordMustBeStrong = 'Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbols',
  ConfirmPasswordIsRequired = 'Confirm password is required',
  ConfirmPasswordMustBeAString = 'Confirm password must be a string',
  PasswordsDoNotMatch = 'Passwords do not match',
  PasswordIsIncorrect = 'Password is incorrect',
  OldPasswordAndNewPasswordMustBeDifferent = 'Old password and new password must be different',
  ChangePasswordSuccess = 'Change password successfully',
  DateOfBirthMustBeISO8601 = 'Date of birth must be ISO 8601',
  LoginSuccess = 'Login success',
  RegisterSuccess = 'Register success',
  LogoutSuccess = 'Logout success',
  AccessTokenIsRequired = 'Access token is required',
  AccessTokenIsInvalid = 'Access token is invalid',
  RefreshTokenIsRequired = 'Refresh token is required',
  RefreshTokenIsInvalid = 'Refresh token is invalid',
  UsedRefreshTokenOrNotExist = 'Used refresh token or not exist',
  RefreshTokenSuccess = 'Refresh token successfully',
  EmailVerifyTokenIsRequired = 'Email verify token is required',
  UserNotFound = 'User not found',
  EmailAlreadyVerifiedBefore = 'Email already verified before',
  EmailVerifySuccess = 'Email verify success',
  ResendVerificationEmailSuccess = 'Resend verification email success',
  CheckEmailToResetPassword = 'Check email to reset password',
  ForgotPasswordTokenIsRequired = 'Forgot password token is required',
  VerifyForgotPasswordSuccess = 'Verify forgot password successfully',
  ForgotPasswordTokenIsInvalid = 'Forgot password token is invalid',
  ResetPasswordSuccess = 'Reset password successfully',
  GetMeSuccess = 'Get my profile successfully',
  GetProfileSuccess = 'Get profile successfully',
  UpdateMeSuccess = 'Update my profile successfully',
  UserNotVerified = 'User not verified',
  BioMustBeAString = 'Bio must be a string',
  BioLengthRequired = 'Bio length must be from 1 to 200 characters',
  LocationMustBeAString = 'Location must be a string',
  LocationLengthRequired = 'Location length must be from 1 to 200 characters',
  WebsiteMustBeAString = 'Website must be a string',
  WebsiteLengthRequired = 'Website length must be from 1 to 200 characters',
  UsernameMustBeAString = 'Username must be a string',
  UsernameLengthRequired = 'Username length must be from 1 to 50 characters',
  UsernameInvalid = 'Username length must be 4-15 characters and contains only letters, numbers, underscores and not only numbers',
  UsernameAlreadyExists = 'Username already exists',
  ImageURLMustBeAString = 'Image URL must be a string',
  ImageURLLengthRequired = 'Image URL length must be from 1 to 400 characters',
  FollowSuccess = 'Follow successfully',
  UnfollowSuccess = 'Unfollow successfully',
  InvalidUserId = 'Invalid user id',
  AlreadyFollowed = 'Already followed',
  AlreadyUnfollowed = 'Already unfollowed',
  CannotFollowYourself = 'Cannot follow yourself',
  GoogleEmailNotVerified = 'Google email not verified'
}

export enum MediasMessages {
  'UploadImageSuccess' = 'Uploading image successfully',
  'UploadVideoSuccess' = 'Uploading video successfully',
  'FileTypeIsNoValid' = 'File type is not valid',
  'FileIsEmpty' = 'File is empty'
}

export enum TweetsMessages {
  'TypeIsRequired' = 'Type is required',
  'InvalidType' = 'Invalid type',
  'AudienceIsRequired' = 'Audience is required',
  'InvalidAudience' = 'Invalid audience',
  'ParentIdMustBeAValidTweetId' = 'Parent id must be a valid tweet id',
  'ParentIdMustBeNull' = 'Parent id must be null',
  'ContentMustBeEmptyString' = 'Content must be empty string',
  'ContentMustBeAnNonEmptyString' = 'Content must be an non empty string',
  'HashtagsMustBeAnArrayOfString' = 'Hashtags must be an array of string',
  'MentionsMustBeAnArrayOfUserId' = 'Mentions must be an array of user id',
  'MediasMustBeAnArrayOfMediaObject' = 'Medias must be an array of media object',
  'CreateTweetSuccess' = 'Create a new Tweet successfully',
  'GetTweetSuccess' = 'Get Tweet detail successfully',
  'InvalidTweetId' = 'invalid tweet_id',
  'TweetNotFound' = 'Tweet not found',
  'TweetIsNotPublic' = 'Tweet is not public'
}

export enum BookmarksMessages {
  'BookmarkTweetSuccess' = 'Bookmark tweet successfully',
  'UnbookmarkTweetSuccess' = 'Unbookmark tweet successfully'
}

export enum LikesMessages {
  'LikeTweetSuccess' = 'Like tweet successfully',
  'UnlikeTweetSuccess' = 'Unlike tweet successfully'
}
