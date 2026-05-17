<?php
/**
 * CouponHandler
 * Sprint 4: Gutschein einlösen
 */
class couponHandler

{
    private CouponDataHandler $couponDataHandler;
    
     public function __construct(CouponDataHandler $couponDataHandler)
    {
        $this->couponDataHandler = $couponDataHandler;
    }
}
