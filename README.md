# Resubscribe React SDK

![NPM Version](https://img.shields.io/npm/v/resubscribe-react-native-sdk)

The official React Native SDK for [Resubscribe](https://resubscribe.ai).

## Setup

Mount the component and then trigger the Resubscribe modal with the `openWithConsent` method. Replace the placeholders with your own values.

```typescript
import Resubscribe from 'resubscribe-react-native-sdk';

export default function Home() {
  const onTrigger = () => {
    Resubscribe.openWithConsent({
      slug: '{organization-slug}',
      aiType: '{ai-type}',
      userId: '{uid}',
      userEmail: '{optionalEmail}',
      colors: {
        primary: 'blue',
        background: '#eee',
        text: '#333',
      },
      onClose: (via) => {
        //
      },
    });
  };

  return (
    <View>
      ...
      <Resubscribe.Component />
    </View>
  )
}
```

## Headless

You can alternatively use the headless version of the SDK.

```typescript
import Resubscribe, { ResubscribeOptions } from 'resubscribe-react-native-sdk';

export default function Home() {
  const onOpenConsent = async () => {
    Resubscribe.headless.setOptions({
      slug: '{organization-slug}',
      aiType: '{ai-type}',
      userId: '{uid}',
      userEmail: '{optionalEmail}',
    });
    Resubscribe.headless.registerConsentRequest();
    // Open your own consent modal here 👇
    const confirmed = await confirm(...);

    if (confirmed) {
      Resubscribe.headless.openChat({
        onClose: (via: any) => {
          console.log('onClose', via);
        },
      });
    }
  };

  return (
    <View>
      ...
      <Resubscribe.Component />
    </View>
  )
}
```
