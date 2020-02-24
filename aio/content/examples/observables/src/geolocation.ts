import { Observable } from 'rxjs';

// #docregion

// 구독자가 구독을 실행하면 새로운 Observable 인스턴스를 생성하고
// 클라이언트의 접속 위치를 추적하기 시작합니다.
const locations = new Observable((observer) => {
<<<<<<< HEAD
  // 스트림으로 전달되는 데이터와 에러를 처리할 콜백 함수를 가져옵니다.
  // 이 핸들러들은 구독자가 구독할 때 전달됩니다.
  const {next, error} = observer;
  let watchId;
=======
  let watchId: number;
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

  // 접속 위치를 처리하는 API는 간단하게 사용해 봅니다.
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition((position: Position) => {
      observer.next(position);
    }, (error: PositionError) => {
      observer.error(error);
    });
  } else {
    observer.error('Geolocation not available');
  }

<<<<<<< HEAD
  // 구독자가 구독을 해지하면 사용하던 데이터를 모두 지웁니다.
  return {unsubscribe() { navigator.geolocation.clearWatch(watchId); }};
=======
  // When the consumer unsubscribes, clean up data ready for next subscription.
  return {
    unsubscribe() {
      navigator.geolocation.clearWatch(watchId);
    }
  };
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
});

// 옵저버블을 시작하려면 subscribe() 함수를 실행합니다.
const locationsSubscription = locations.subscribe({
  next(position) {
    console.log('Current Position: ', position);
  },
  error(msg) {
    console.log('Error Getting Location: ', msg);
  }
});

<<<<<<< HEAD
// 옵저버블은 10초 후에 구독을 해지합니다.
setTimeout(() => { locationsSubscription.unsubscribe(); }, 10000);
=======
// Stop listening for location after 10 seconds
setTimeout(() => {
  locationsSubscription.unsubscribe();
}, 10000);
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
// #enddocregion
