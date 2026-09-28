#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

@interface ImageSaver : NSObject <RCTBridgeModule>
@end

@implementation ImageSaver

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(saveImage:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // The filePath from view-shot is typically a file URI
    NSURL *fileURL = [NSURL URLWithString:filePath];
    if (!fileURL || !fileURL.scheme) {
        fileURL = [NSURL fileURLWithPath:filePath];
    }
    
    NSData *imageData = [NSData dataWithContentsOfURL:fileURL];
    if (!imageData) {
        reject(@"SAVE_ERROR", @"Failed to read image data", nil);
        return;
    }
    
    UIImage *image = [UIImage imageWithData:imageData];
    if (!image) {
        reject(@"SAVE_ERROR", @"Failed to create image from data", nil);
        return;
    }
    
    // Save to photos album
    UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil);
    resolve(@(YES));
}

@end
